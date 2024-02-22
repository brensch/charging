package statemachine

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/brensch/charging/mothership/setup"
	"github.com/google/uuid"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	influxdb2api "github.com/influxdata/influxdb-client-go/v2/api"
	"google.golang.org/api/iterator"
)

const (
	secondsToStore = 10
	statesToStore  = 100
)

type PlugStateMachine struct {
	plugID string
	siteID string

	latestReadingMu  sync.Mutex
	latestReadingPtr int
	latestReadings   []*contracts.Reading

	stateMu        sync.Mutex
	latestStatePtr int
	state          contracts.StateMachineState
	transitions    []*contracts.StateMachineTransition
	currentOwner   string

	// this needs to be in the firestore object for resuming
	chargeStartTime time.Time

	// QUEUE
	queuePosition  int64
	queueEnteredMs int64

	errMu sync.Mutex
	err   error

	settingsMu sync.Mutex
	settings   *contracts.PlugSettings

	influxAPI influxdb2api.WriteAPI
	fs        *firestore.Client

	siteTopic *pubsub.Topic
}

func InitPlugStateMachine(ctx context.Context, fs *firestore.Client, pubsubClient *pubsub.Client, influx influxdb2api.WriteAPI, siteID, plugID string) *PlugStateMachine {
	log.Println("initialising plug", plugID)

	latestReadings := make([]*contracts.Reading, secondsToStore)

	receiveTopicName := fmt.Sprintf("commands_%s", siteID)

	topic := pubsubClient.Topic(receiveTopicName)
	transitions := make([]*contracts.StateMachineTransition, statesToStore)

	stateMachine := &PlugStateMachine{
		plugID:           plugID,
		latestReadingPtr: -1,
		latestReadings:   latestReadings,
		transitions:      transitions,
		siteTopic:        topic,
		siteID:           siteID,
		influxAPI:        influx,
		fs:               fs,
	}

	err := setup.EnsurePlugIsInFirestore(ctx, fs, siteID, plugID)
	if err != nil {
		log.Fatalf("problem ensuring plug doc: %+v", err)
	}

	stateMachine.Start(ctx, fs)
	stateMachine.ListenToSettings(ctx, fs)

	return stateMachine
}

// type TransitionFunc func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition
type TransitionFunc func(ctx context.Context, p *PlugStateMachine) bool

type StateTransition struct {
	TargetState contracts.StateMachineState
	// DoTransition is used by the internal state machine
	DoTransition TransitionFunc

	// This means that we should not attempt this transition from the state loop
	AsyncOnly            bool
	Reason               string
	ConditionExplanation string
}

func (p *PlugStateMachine) Error(err error) {
	p.errMu.Lock()
	p.err = err
	p.errMu.Unlock()
}

func (p *PlugStateMachine) State() contracts.StateMachineState {
	p.stateMu.Lock()
	defer p.stateMu.Unlock()
	return p.state
}

func (p *PlugStateMachine) SetCurrentOwner(owner string) {
	p.stateMu.Lock()
	p.currentOwner = owner
	p.stateMu.Unlock()
}

func (p *PlugStateMachine) Transition(ctx context.Context, StateMap map[contracts.StateMachineState][]StateTransition, targetState contracts.StateMachineState) bool {
	log.Println("waiting for lock")
	p.stateMu.Lock()
	log.Println("got lock")

	defer p.stateMu.Unlock()
	defer fmt.Println("finished transition")

	log.Println("checking transition for ", p.plugID, p.state, targetState)

	potentialStates, ok := StateMap[p.state]
	if !ok {
		log.Println("no such state in statemap, very odd", p.state)
		return false
	}

	for _, potentialState := range potentialStates {
		if potentialState.TargetState != targetState {
			continue
		}
		log.Println("seeing if state works", p.state, potentialState.TargetState)

		transitioned := true
		if potentialState.DoTransition != nil {
			transitioned = potentialState.DoTransition(ctx, p)
		}
		if !transitioned {
			continue
		}
		log.Println("transitioned", p.state, potentialState.TargetState)

		transition := &contracts.StateMachineTransition{
			Id:      uuid.NewString(),
			State:   potentialState.TargetState,
			Reason:  potentialState.Reason,
			PlugId:  p.plugID,
			OwnerId: p.currentOwner,
			TimeMs:  time.Now().UnixMilli(),
		}

		err := p.performTransition(ctx, transition)
		if err != nil {
			log.Println("failed performing transition", err)
			return false
		}

		return true
	}

	return false

}

func (p *PlugStateMachine) Start(ctx context.Context, fs *firestore.Client) {
	ticker := time.NewTicker(1 * time.Second)
	go func() {
		for {
			select {
			case <-ticker.C:
				state, ok := StateMap[p.state]
				if !ok {
					fmt.Println("no definition for state", p.state)
					break
				}

				for _, nextState := range state {
					if nextState.AsyncOnly {
						continue
					}
					transitioned := p.Transition(ctx, StateMap, nextState.TargetState)
					if transitioned {
						break
					}
				}

				// initialising telemetry still
				if p.latestReadingPtr == -1 {
					continue
				}

				// update latest state in firestore if someone has looked at the site in the last 30 seconds

				p.settingsMu.Lock()
				latestViewing := p.settings.LastTimeUserCheckingMs
				p.settingsMu.Unlock()

				p.latestReadingMu.Lock()
				latestReading := p.latestReadings[p.latestReadingPtr]
				p.latestReadingMu.Unlock()

				plugID := p.plugID

				if latestViewing > time.Now().UnixMilli()-30*1000 {
					log.Println("updating latest readings in firestore", plugID, latestViewing, time.Now().UnixMilli()-30*1000)
					go func() {
						fs.Collection(common.CollectionPlugStatus).Doc(plugID).Update(ctx, []firestore.Update{
							{Path: "latest_reading", Value: latestReading},
						})
					}()
				}

			case <-ctx.Done():
				log.Println("context done for plug", p.plugID)
				return
			}
		}

	}()
}

func (p *PlugStateMachine) ListenToSettings(ctx context.Context, fs *firestore.Client) {
	// listen to all plug settings updates (from UI so using firestore)
	plugSettingsQuery := fs.Collection(common.CollectionPlugSettings).Query.Where("id", "==", p.plugID)
	// do one request to get all the plugsettings and initialise the map
	allPlugSettings, err := plugSettingsQuery.Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("failed to get plug settings: %+v", err)
	}
	if len(allPlugSettings) != 1 {
		log.Fatalf("should have exactly 1 plugsetting doc, got %d", len(allPlugSettings))
	}
	// should only be one but will iterate
	for _, plug := range allPlugSettings {
		var plugSetting *contracts.PlugSettings
		err = plug.DataTo(&plugSetting)
		if err != nil {
			log.Fatalf("failed to read a plug setting. should address this")
		}
		p.settings = plugSetting
	}

	// then listen to all docs
	plugSettingsIter := plugSettingsQuery.Snapshots(ctx)
	// TODO: return stop func and do it. for the time being can run indefinitely
	// defer plugSettingsIter.Stop()
	go func() {
		for {
			// Await the next snapshot.
			snap, err := plugSettingsIter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				fmt.Printf("Error listening to settings changes: %v\n", err)
				time.Sleep(1 * time.Second)
				continue
			}

			for _, change := range snap.Changes {
				var updatedPlugSetting *contracts.PlugSettings
				err = change.Doc.DataTo(&updatedPlugSetting)
				if err != nil {
					fmt.Println("failed to read plug setting", err)
					continue
				}

				p.settingsMu.Lock()
				p.settings.CurrentLimit = updatedPlugSetting.CurrentLimit
				p.settings.LastTimeUserCheckingMs = updatedPlugSetting.LastTimeUserCheckingMs
				p.settings.Name = updatedPlugSetting.Name
				p.settingsMu.Unlock()

			}
		}
	}()
}

func (p *PlugStateMachine) RequestLocalState(ctx context.Context, state contracts.RequestedState) error {
	request := &contracts.LocalStateRequest{
		Id:             uuid.NewString(),
		PlugId:         p.plugID,
		SiteId:         p.siteID,
		RequestedState: state,
		RequestTime:    time.Now().UnixMilli(),
	}
	requestBytes, err := common.PackData(request)
	if err != nil {
		return err
	}

	res := p.siteTopic.Publish(ctx, &pubsub.Message{
		Data: []byte(requestBytes),
	})

	_, err = res.Get(ctx)
	return err
}

func (p *PlugStateMachine) writeReadingToDB(ctx context.Context, reading *contracts.Reading) error {
	point := influxdb2.NewPointWithMeasurement("plug_readings").
		SetTime(time.UnixMilli(reading.GetTimestampMs())).
		AddTag("site_id", p.siteID).
		AddTag("plug_id", reading.PlugId).
		AddTag("fuze_id", reading.FuzeId).
		AddField("state", reading.State).
		AddField("current", reading.Current).
		AddField("voltage", reading.Voltage).
		AddField("power_factor", reading.PowerFactor)
	p.influxAPI.WritePoint(point)

	// keeping the error here in case the internals of this function end up throwing an error
	return nil
}

func (p *PlugStateMachine) performTransition(ctx context.Context, transition *contracts.StateMachineTransition) error {

	p.state = transition.GetState()
	nextStatePtr := (p.latestStatePtr + 1) % statesToStore
	p.transitions[nextStatePtr] = transition
	p.latestStatePtr = nextStatePtr

	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state", Value: transition},
	})

	point := influxdb2.NewPointWithMeasurement("plug_transitions").
		SetTime(time.Now()).
		AddTag("site_id", p.siteID).
		AddTag("plug_id", p.plugID).
		AddField("state", transition.GetState().String()).
		AddField("reason", transition.GetReason())
	p.influxAPI.WritePoint(point)

	return err
}
