package statemachine

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/brensch/charging/mothership/setup"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	"github.com/InfluxCommunity/influxdb3-go/influxdb3"
	"github.com/google/uuid"
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

	stateMu sync.Mutex
	state   *contracts.StateMachineTransition

	detailsMu sync.Mutex
	details   *contracts.StateMachineDetails

	errMu sync.Mutex
	err   error

	settingsMu sync.Mutex
	settings   *contracts.PlugSettings

	pointsCHAN chan PointToAck
	ifClient   *influxdb3.Client
	fs         *firestore.Client

	siteTopic *pubsub.Topic
}

type PointToAck struct {
	Point *influxdb3.Point
	Msg   *pubsub.Message
}

func InitPlugStateMachine(ctx context.Context, fs *firestore.Client, pubsubClient *pubsub.Client, ifClient *influxdb3.Client, pointsCHAN chan PointToAck, status *contracts.PlugStatus) *PlugStateMachine {
	log.Println("initialising plug", status.Id)

	latestReadings := make([]*contracts.Reading, secondsToStore)

	receiveTopicName := fmt.Sprintf("commands_%s", status.SiteId)

	topic := pubsubClient.Topic(receiveTopicName)

	stateMachine := &PlugStateMachine{
		plugID:           status.Id,
		latestReadingPtr: -1,
		latestReadings:   latestReadings,
		siteTopic:        topic,
		siteID:           status.SiteId,
		details:          &contracts.StateMachineDetails{}, // no need to init to zero for internal use
		state:            status.State,

		fs:         fs,
		pointsCHAN: pointsCHAN,
		ifClient:   ifClient,
	}

	err := setup.EnsurePlugIsInFirestore(ctx, fs, status.SiteId, status.Id)
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
	AsyncOnly  bool
	Reason     string
	UserPrompt string // if this is set, users are able to select it
}

func (p *PlugStateMachine) Error(err error) {
	p.errMu.Lock()
	p.err = err
	p.errMu.Unlock()
}

func (p *PlugStateMachine) State() *contracts.StateMachineTransition {
	p.stateMu.Lock()
	defer p.stateMu.Unlock()
	return p.state
}

func (p *PlugStateMachine) SetOwner(ctx context.Context, owner string) error {
	p.detailsMu.Lock()
	defer p.detailsMu.Unlock()
	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state_machine_details.current_owner", Value: owner},
	})
	if err != nil {
		return err
	}

	p.details.CurrentOwner = owner

	return nil
}

func (p *PlugStateMachine) SetChargeStartTimeMs(ctx context.Context, chargeStartTimeMs int64) error {
	p.detailsMu.Lock()
	defer p.detailsMu.Unlock()
	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state_machine_details.charge_start_time_ms", Value: chargeStartTimeMs},
	})
	if err != nil {
		return err
	}

	p.details.ChargeStartTimeMs = chargeStartTimeMs

	return nil
}

func (p *PlugStateMachine) SetQueuePosition(ctx context.Context, queuePosition int64) error {
	p.detailsMu.Lock()
	defer p.detailsMu.Unlock()
	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state_machine_details.queue_position", Value: queuePosition},
	})
	if err != nil {
		return err
	}

	p.details.QueuePosition = queuePosition

	return nil
}

func (p *PlugStateMachine) SetQueueEnteredMs(ctx context.Context, queueEnteredMs int64) error {
	p.detailsMu.Lock()
	defer p.detailsMu.Unlock()
	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state_machine_details.queue_entered_ms", Value: queueEnteredMs},
	})
	if err != nil {
		return err
	}

	p.details.QueueEnteredMs = queueEnteredMs

	return nil
}

func (p *PlugStateMachine) SetError(ctx context.Context, error string) error {
	p.detailsMu.Lock()
	defer p.detailsMu.Unlock()
	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state_machine_details.error", Value: error},
	})
	if err != nil {
		return err
	}

	p.details.Error = error

	return nil
}

func (p *PlugStateMachine) Transition(ctx context.Context, StateMap map[contracts.StateMachineState][]StateTransition, targetState contracts.StateMachineState) bool {
	log.Println("waiting for lock")
	p.stateMu.Lock()
	log.Println("got lock")

	defer p.stateMu.Unlock()

	log.Println("checking transition for ", p.plugID, p.state, targetState)

	potentialStates, ok := StateMap[p.state.State]
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

		p.detailsMu.Lock()
		owner := p.details.CurrentOwner
		p.detailsMu.Unlock()

		transition := &contracts.StateMachineTransition{
			Id:      uuid.NewString(),
			State:   potentialState.TargetState,
			Reason:  potentialState.Reason,
			PlugId:  p.plugID,
			OwnerId: owner,
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
				state, ok := StateMap[p.state.State]
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

func (p *PlugStateMachine) writeReadingToDB(ctx context.Context, reading *contracts.Reading, msg *pubsub.Message) error {
	point := influxdb3.NewPointWithMeasurement("plug_readings").
		SetTimestamp(time.UnixMilli(reading.GetTimestampMs())).
		SetTag("site_id", p.siteID).
		SetTag("plug_id", reading.PlugId).
		SetTag("fuze_id", reading.FuzeId).
		SetField("state", reading.State).
		SetField("current", reading.Current).
		SetField("voltage", reading.Voltage).
		SetField("power_factor", reading.PowerFactor)
	p.pointsCHAN <- PointToAck{
		Point: point,
		Msg:   msg,
	}

	// keeping the error here in case the internals of this function end up throwing an error
	return nil
}

func (p *PlugStateMachine) performTransition(ctx context.Context, transition *contracts.StateMachineTransition) error {

	p.state = transition

	// get the next possible states from what we're transition to
	nextStates, ok := StateMap[transition.State]
	if !ok {
		return fmt.Errorf("could not find next state in state map. bug.")
	}

	states := []contracts.StateMachineState{}
	stateLabels := []string{}

	for _, state := range nextStates {
		if state.UserPrompt == "" {
			continue
		}
		states = append(states, state.TargetState)
		stateLabels = append(stateLabels, state.UserPrompt)
	}

	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state", Value: transition},
		{Path: "possible_next_states", Value: states},
		{Path: "possible_next_states_labels", Value: stateLabels},
	})
	if err != nil {
		return err
	}

	point := influxdb3.NewPointWithMeasurement("plug_transitions").
		SetTimestamp(time.Now()).
		SetTag("site_id", p.siteID).
		SetTag("plug_id", p.plugID).
		SetField("state", transition.GetState().String()).
		SetField("reason", transition.GetReason())
	return p.ifClient.WritePoints(ctx, point)

}

// this is just for doing the transition. setting of session id and user need to be done before this step.
// unsetting user should be after.
// TODO: slight jank detection, may want to separate objects out
func (p *PlugStateMachine) updateSession(ctx context.Context, eventType contracts.SessionEventType) error {

	p.detailsMu.Lock()
	defer p.detailsMu.Unlock()
	if p.details.CurrentOwner == "" {
		return fmt.Errorf("current owner not set. must be set when calling updatesession: %s", eventType)
	}

	_, err := p.fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state_machine_details.session_id", Value: p.details.SessionId},
	})
	if err != nil {
		return err
	}
	fmt.Println("writing session point")

	point := influxdb3.NewPointWithMeasurement("sessions").
		SetTimestamp(time.Now()).
		SetTag("site_id", p.siteID).
		SetTag("plug_id", p.plugID).
		SetField("state", eventType.String()).
		SetField("owner", p.details.CurrentOwner).
		SetField("session_id", p.details.SessionId)
	return p.ifClient.WritePoints(ctx, point)

}
