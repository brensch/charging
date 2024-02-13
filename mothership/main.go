package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"sync"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	"github.com/google/uuid"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
	"google.golang.org/protobuf/proto"
)

const (
	keyFile                 = "./mothership.key"
	telemetryTopicName      = "telemetry"
	commandResultsTopicName = "command_results"

	secondsToStore = 10
	statesToStore  = 100

	influxOrg         = "Niquist"
	influxBucketNEM   = "nem"
	influxBucketSites = "opc"
	influxHost        = "https://us-east-1-1.aws.cloud2.influxdata.com"
)

// type SiteStateMachine struct {
// 	plugStateMachines map[string]*PlugStateMachine
// 	mu                sync.Mutex
// }

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

var (
	stateMap = map[contracts.StateMachineState][]StateTransition{
		contracts.StateMachineState_StateMachineState_INITIALISING: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_OFF,
				DetectTransition: func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition {
					// TODO: should actually check to see what the current state of the device is in
					return &contracts.StateMachineTransition{
						Id:      uuid.NewString(),
						State:   contracts.StateMachineState_StateMachineState_OFF,
						Reason:  "off from initialising",
						PlugId:  p.plugID,
						OwnerId: "machine", // todo figure out
						TimeMs:  time.Now().UnixMilli(),
					}
				},
			},
		},
		contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF,
				DetectTransition: func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition {
					err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_OFF)
					if err != nil {
						log.Println("got error requesting local state", err)
						// TODO: how to handle errors
						return nil
					}
					return &contracts.StateMachineTransition{
						Id:      uuid.NewString(),
						State:   contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF,
						Reason:  "sent off command to site",
						PlugId:  p.plugID,
						OwnerId: "machine", // todo figure out
						TimeMs:  time.Now().UnixMilli(),
					}
				},
			},
		},
		contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_OFF,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF {
						log.Println("got wrong state trying to transition to off", p.state)
						return false
					}

					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_OFF {
						log.Println("got wrong state trying to transition to on", p.state)
						return false
					}

					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON,
				DetectTransition: func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition {
					err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_ON)
					if err != nil {
						log.Println("got error requesting local state", err)
						// TODO: how to handle errors
						return nil
					}
					return &contracts.StateMachineTransition{
						Id:      uuid.NewString(),
						State:   contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON,
						Reason:  "sent on command to site",
						PlugId:  p.plugID,
						OwnerId: "machine", // todo figure out
						TimeMs:  time.Now().UnixMilli(),
					}
				},
			},
		},
		contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ON,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON {
						log.Println("got wrong state trying to transition to off", p.state)
						return false
					}

					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_ON {
						log.Println("got wrong state trying to transition to off", p.state)
						return false
					}

					return true
				},
			},
		},
	}
)

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

				// update latest state in firestore if someon has looked at the site in the last 30 seconds
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
	// TODO: return this and do it. for the time being can run indefinitely
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

				log.Println("got latest reading time", updatedPlugSetting.Id, updatedPlugSetting.LastTimeUserCheckingMs)
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

	return SendLocalStateRequest(ctx, p.siteTopic, request)
}

func (p *PlugStateMachine) WriteReadingToDB(ctx context.Context, reading *contracts.Reading) error {
	point := influxdb2.NewPointWithMeasurement("plug_readings").
		SetTime(time.UnixMilli(reading.GetTimestamp())).
		AddTag("site_id", p.siteID).
		AddTag("plug_id", reading.PlugId).
		AddTag("fuze_id", reading.FuzeId).
		AddField("state", reading.State).
		AddField("current", reading.Current).
		AddField("voltage", reading.Voltage).
		AddField("power_factor", reading.PowerFactor).
		AddField("energy", reading.Energy)

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

func main() {
	ctx := context.Background()
	var mu sync.Mutex

	projectID, _, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	client, err := pubsub.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	telemetrySub := client.Subscription(telemetryTopicName)
	commandResultsSub := client.Subscription(commandResultsTopicName)

	options := influxdb2.DefaultOptions()
	options.SetBatchSize(10)
	options.SetFlushInterval(10)

	influxTokenBytes, err := os.ReadFile("influx.key")
	if err != nil {
		log.Fatalf("problem reading influx token: %v", err)
	}
	fmt.Println(string(influxTokenBytes))

	ifClient := influxdb2.NewClientWithOptions(influxHost, string(influxTokenBytes), options)

	ifClientWriteSites := ifClient.WriteAPI(influxOrg, influxBucketSites)
	defer ifClientWriteSites.Flush()

	// Set up Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer fs.Close()

	// this is used to store all the state machines for each plug
	stateMachines := make(map[string]*PlugStateMachine)
	var stateMachinesMu sync.Mutex

	plugStatusQuery := fs.Collection(common.CollectionPlugStatus).Query
	plugStatuses, err := plugStatusQuery.Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("couldn't get plug statuses", err)
	}

	for _, plugStatusDoc := range plugStatuses {
		var plugStatus *contracts.PlugStatus
		plugStatusDoc.DataTo(&plugStatus)
		stateMachines[plugStatus.GetId()] = InitPlugStateMachine(ctx, fs, client, ifClientWriteSites, plugStatus.GetSiteId(), plugStatus.GetLatestReading())
	}

	// listen to user requests
	userRequests := fs.Collection(common.CollectionUserRequests)
	query := userRequests.Where("result.status", "==", 1)
	iter := query.Snapshots(ctx)
	defer iter.Stop()

	// Handle commands coming from document changes
	go func() {
		for {
			// Await the next snapshot.
			snap, err := iter.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				fmt.Printf("Error listening to changes: %v\n", err)
				continue
			}

			for _, change := range snap.Changes {
				if change.Kind == firestore.DocumentAdded {
					// Decode the document into the UserRequest struct
					var userRequest *contracts.UserRequest
					if err := change.Doc.DataTo(&userRequest); err != nil {
						fmt.Printf("Error decoding document: %v\n", err)
						continue
					}

					plugStateMachine, ok := stateMachines[userRequest.PlugId]
					if !ok {
						// don't accept errors from users, who knows what nonsense they're up to
						log.Println("got missing plugid: %s", userRequest.PlugId)
						continue
					}

					availableStates, ok := stateMap[plugStateMachine.state]
					if !ok {
						log.Println("requested invalid state")
						continue
					}

					stateAllowed := false
					for _, state := range availableStates {
						fmt.Println(state.TargetState, userRequest.GetRequestedState())
						if state.TargetState != userRequest.GetRequestedState() {
							continue
						}
						stateAllowed = true
						break
					}

					if !stateAllowed {
						log.Println("state not allowed", userRequest.GetRequestedState())
						resRequestResult := &contracts.UserRequestResult{
							TimeEnteredState: time.Now().UnixMilli(),
							Status:           contracts.UserRequestStatus_RequestedStatus_FAILURE,
							Reason:           fmt.Sprintf("State %s not valid from %s", userRequest.GetRequestedState(), plugStateMachine.state),
						}
						_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
							{Path: "result", Value: resRequestResult},
						})
						if err != nil {
							fmt.Printf("Error updating user requests: %v\n", err)
						}
						continue
					}
					fmt.Printf("Received new user request: %+v: %s\n", userRequest.PlugId, userRequest.RequestedState)

					transition := plugStateMachine.ConvertCustomerRequest(userRequest)
					if transition == nil {
						log.Println("no transition possible")
					}

					// update the document that we received it
					resRequestResult := &contracts.UserRequestResult{
						TimeEnteredState: time.Now().UnixMilli(),
						Status:           contracts.UserRequestStatus_RequestedStatus_RECEIVED,
					}
					_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
						{Path: "result", Value: resRequestResult},
					})
					if err != nil {
						fmt.Printf("Error updating user requests: %v\n", err)
						continue
					}
					err = change.Doc.DataTo(&userRequest)
					if err != nil {
						fmt.Printf("Error updating userrequestresult: %v\n", err)
						continue
					}

					err = plugStateMachine.PerformTransition(ctx, fs, transition)
					if err != nil {
						fmt.Printf("Error performing transition: %v\n", err)
						// update the document that we received it
						resRequestResult = &contracts.UserRequestResult{
							TimeEnteredState: time.Now().UnixMilli(),
							Status:           contracts.UserRequestStatus_RequestedStatus_FAILURE,
						}
						_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
							{Path: "result", Value: resRequestResult},
						})
						if err != nil {
							fmt.Printf("Error updating user requests: %v\n", err)
							continue
						}
						continue
					}

					// update the document that we succeeded
					resRequestResult = &contracts.UserRequestResult{
						TimeEnteredState: time.Now().UnixMilli(),
						Status:           contracts.UserRequestStatus_RequestedStatus_SUCCESS,
					}
					_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
						{Path: "result", Value: resRequestResult},
					})
					if err != nil {
						fmt.Printf("Error updating user requests: %v\n", err)
						continue
					}

				}
			}
		}
	}()

	// listen to responses from devices about commands
	go func() {

		commandResultsSub.Receive(ctx, func(ctx context.Context, m *pubsub.Message) {
			response, err := ReceiveCommandResponse(ctx, m)
			if err != nil {
				log.Println("failed to read command response")
				return
			}

			var state contracts.StateMachineState
			switch response.ResultantState {
			case contracts.RequestedState_RequestedState_ON:
				state = contracts.StateMachineState_StateMachineState_ON
			case contracts.RequestedState_RequestedState_OFF:
				state = contracts.StateMachineState_StateMachineState_OFF
			}
			// receiving a response from the device indicates we should send the transition regardless
			transition := &contracts.StateMachineTransition{
				Id:     uuid.NewString(),
				State:  state,
				Reason: "device responded to state request",
				TimeMs: time.Now().UnixMilli(),
				PlugId: response.GetPlugId(),
			}

			plug, ok := stateMachines[response.GetPlugId()]
			if !ok {
				fmt.Println("no plug state machine....", response.GetPlugId())
				return
			}

			err = plug.PerformTransition(ctx, fs, transition)
			if err != nil {
				log.Println("failed to perform transition from locally received state", err)
				return
			}
		})
	}()

	// listen to telemetry
	err = telemetrySub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		mu.Lock()
		defer mu.Unlock()

		chunk, err := UnpackMessage(ctx, msg)
		if err != nil {
			log.Println("Failed to read message: %v", err)
			return
		}

		for _, reading := range chunk.Readings {
			go func(reading *contracts.Reading) {

				if reading.GetTimestamp() == 0 {
					yo, _ := json.Marshal(reading)
					fmt.Println(string(yo))
					panic("got 0 timestamp")
				}

				stateMachinesMu.Lock()
				plugStateMachine, ok := stateMachines[reading.PlugId]
				stateMachinesMu.Unlock()
				if !ok {
					// TODO: alert on this, shouldn't be adding new plugs often
					log.Println("couldn't find plug", reading.PlugId)
					plugStateMachine = InitPlugStateMachine(ctx, fs, client, ifClientWriteSites, chunk.GetSiteId(), reading)

					// this only needs to be done if we receive a non existant plug id from a reading
					err = EnsurePlugIsInFirestore(ctx, fs, chunk.GetSiteId(), reading)
					if err != nil {
						log.Println("failed to init new plug state machine")
						return
					}
					stateMachinesMu.Lock()
					stateMachines[reading.PlugId] = plugStateMachine
					stateMachinesMu.Unlock()
				}

				// inline func to ensure unlock
				// TODO: make this better
				plugStateMachine.mu.Lock()
				defer plugStateMachine.mu.Unlock()

				nextPtr := (plugStateMachine.latestReadingPtr + 1) % secondsToStore
				plugStateMachine.latestReadings[nextPtr] = reading
				plugStateMachine.latestReadingPtr = nextPtr
				err = plugStateMachine.WriteReadingToDB(ctx, reading)
				if err != nil {
					log.Println("failed to write reading to db")
					return
				}

			}(reading)
		}

	})

	if err != nil {
		log.Fatalf("Failed to receive messages: %v", err)
	}
}

func EnsurePlugIsInFirestore(ctx context.Context, fs *firestore.Client, siteID string, reading *contracts.Reading) error {
	err := ensurePlugSettingsDoc(ctx, fs, reading.PlugId)
	if err != nil {
		return err
	}

	err = ensurePlugStatusDoc(ctx, fs, siteID, reading)
	if err != nil {
		return err
	}

	return nil
}

func InitPlugStateMachine(ctx context.Context, fs *firestore.Client, pubsubClient *pubsub.Client, influx api.WriteAPI, siteID string, reading *contracts.Reading) *PlugStateMachine {
	log.Println("initialising plug", reading.GetPlugId())

	latestReadings := make([]*contracts.Reading, secondsToStore)
	latestReadings[0] = reading

	receiveTopicName := fmt.Sprintf("commands_%s", siteID)

	topic := pubsubClient.Topic(receiveTopicName)

	transitions := make([]*contracts.StateMachineTransition, statesToStore)

	stateMachine := &PlugStateMachine{
		plugID:           reading.GetPlugId(),
		latestReadingPtr: 0,
		latestReadings:   latestReadings,
		transitions:      transitions,
		siteTopic:        topic,
		siteID:           siteID,
		influxAPI:        influx,
	}

	stateMachine.Start(ctx, fs)
	stateMachine.ListenToSettings(ctx, fs)

	return stateMachine
}

// func EnsurePlugStatusExists

func UnpackMessage(ctx context.Context, msg *pubsub.Message) (*contracts.ReadingChunk, error) {

	// Decompress the data
	reader, err := gzip.NewReader(bytes.NewReader(msg.Data))
	if err != nil {
		log.Println("Error creating gzip reader:", err)
		msg.Nack()
		return nil, err
	}
	defer reader.Close()

	decompressedData, err := io.ReadAll(reader)
	if err != nil {
		log.Println("Error reading decompressed data:", err)
		msg.Nack()
		return nil, err
	}

	// Unmarshal the decompressed data into a ReadingChunk
	var readingChunk contracts.ReadingChunk
	err = proto.Unmarshal(decompressedData, &readingChunk)
	if err != nil {
		log.Println("Error unmarshalling data:", err)
		msg.Nack()
		return nil, err
	}

	// TODO: may need to not ack this until we've flushed. may be awkward since that is quite delayed
	msg.Ack()

	return &readingChunk, nil
}
