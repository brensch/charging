package main

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
	"github.com/google/uuid"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	influxdb2api "github.com/influxdata/influxdb-client-go/v2/api"
	"google.golang.org/api/iterator"
)

type PlugStateMachine struct {
	plugID string
	siteID string

	latestReadingPtr int
	latestReadings   []*contracts.Reading

	latestStatePtr int
	state          contracts.StateMachineState
	transitions    []*contracts.StateMachineTransition

	settings *contracts.PlugSettings

	influxAPI api.WriteAPI

	siteTopic *pubsub.Topic

	mu sync.Mutex
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
	}

	err := EnsurePlugIsInFirestore(ctx, fs, siteID, plugID)
	if err != nil {
		log.Fatalf("problem ensuring plug doc: %+v", err)
	}

	stateMachine.Start(ctx, fs)
	stateMachine.ListenToSettings(ctx, fs)

	return stateMachine
}

type TransitionDetectionFunc func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition

type TransitionCheckFunc func(ctx context.Context, p *PlugStateMachine) bool

type StateTransition struct {
	TargetState contracts.StateMachineState
	// DetectTransition is used by the internal state machine
	DetectTransition TransitionDetectionFunc
	// CheckTransition is used by anything arriving from outside the state machine
	CheckTransition TransitionCheckFunc
}

func (p *PlugStateMachine) Start(ctx context.Context, fs *firestore.Client) {
	ticker := time.NewTicker(1 * time.Second)
	go func() {
		for {
			select {
			case <-ticker.C:
				state, ok := stateMap[p.state]
				if !ok {
					fmt.Println("no definition for state", p.state)
					break
				}

				for _, nextState := range state {
					if nextState.DetectTransition == nil {
						continue
					}

					transition := nextState.DetectTransition(ctx, p)
					if transition == nil {
						continue
					}

					err := p.PerformTransition(ctx, fs, transition)
					if err != nil {
						log.Println("failure doing transition")
					}

				}

				// initialising telemetry still
				if p.latestReadingPtr == -1 {
					continue
				}
				// update latest state in firestore if someone has looked at the site in the last 30 seconds
				p.mu.Lock()
				latestViewing := p.settings.LastTimeUserCheckingMs
				latestReading := p.latestReadings[p.latestReadingPtr]
				plugID := p.plugID
				p.mu.Unlock()

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
		log.Fatalf("failed to get plug settings", err)
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
				fmt.Printf("Error listening to changes: %v\n", err)
				continue
			}

			for _, change := range snap.Changes {
				var updatedPlugSetting *contracts.PlugSettings
				err = change.Doc.DataTo(&updatedPlugSetting)
				if err != nil {
					fmt.Println("failed to read plug setting", err)
					continue
				}

				p.mu.Lock()
				p.settings.CurrentLimit = updatedPlugSetting.CurrentLimit
				p.settings.LastTimeUserCheckingMs = updatedPlugSetting.LastTimeUserCheckingMs
				p.settings.Name = updatedPlugSetting.Name
				p.mu.Unlock()

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

func (p *PlugStateMachine) WriteReadingToDB(ctx context.Context, reading *contracts.Reading) error {
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

func (p *PlugStateMachine) PerformTransition(ctx context.Context, fs *firestore.Client, transition *contracts.StateMachineTransition) error {
	log.Println("got state transition", transition.GetState(), transition.Reason)

	p.state = transition.GetState()
	nextStatePtr := (p.latestStatePtr + 1) % statesToStore
	p.transitions[nextStatePtr] = transition
	p.latestStatePtr = nextStatePtr

	_, err := fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state", Value: transition},
	})

	return err
}

func (p *PlugStateMachine) ConvertCustomerRequest(request *contracts.UserRequest) *contracts.StateMachineTransition {
	// TODO: logic to verify transitioning is ok in the current state
	return &contracts.StateMachineTransition{
		Id:      uuid.New().String(),
		State:   request.GetRequestedState(),
		PlugId:  p.plugID,
		Reason:  fmt.Sprintf("Customer request %s", request.Id),
		TimeMs:  time.Now().UnixMilli(),
		OwnerId: request.UserId,
	}
}

type StateMachineCollection struct {
	stateMachines   map[string]*PlugStateMachine
	stateMachinesMu sync.Mutex
}

func InitStateMachineCollection() *StateMachineCollection {
	return &StateMachineCollection{
		stateMachines: make(map[string]*PlugStateMachine),
	}
}

func (s *StateMachineCollection) GetStateMachine(plugID string) (*PlugStateMachine, bool) {
	s.stateMachinesMu.Lock()
	defer s.stateMachinesMu.Unlock()
	stateMachine, ok := s.stateMachines[plugID]
	return stateMachine, ok
}

func (s *StateMachineCollection) AddStateMachine(stateMachine *PlugStateMachine) {
	s.stateMachinesMu.Lock()
	s.stateMachines[stateMachine.plugID] = stateMachine
	s.stateMachinesMu.Unlock()
}
