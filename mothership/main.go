package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"
	"sync"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
	"google.golang.org/protobuf/proto"
)

const (
	keyFile                 = "./testprovision.key"
	telemetryTopicName      = "telemetry"
	commandResultsTopicName = "command_results"

	secondsToStore = 10
	statesToStore  = 100
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

	accumulatedEnergyUsage float64

	siteTopic *pubsub.Topic

	mu sync.Mutex
}

func (p *PlugStateMachine) RequestLocalState(ctx context.Context, state contracts.RequestedState) error {
	// TODO: actually make this work

	request := &contracts.LocalStateRequest{
		Id:             uuid.NewString(),
		PlugId:         p.plugID,
		SiteId:         p.siteID,
		RequestedState: state,
		RequestTime:    time.Now().UnixMilli(),
	}

	return SendLocalStateRequest(ctx, p.siteTopic, request)
}

// this will eventually be a switch thing.
func (p *PlugStateMachine) DetectTransition(ctx context.Context) *contracts.StateMachineTransition {
	log.Println("checking for transitions", p.plugID, p.state, p.latestReadings[p.latestReadingPtr].Current)
	id := uuid.New().String()

	if p.state == contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON {

		err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_ON)
		if err != nil {
			log.Println("got error requesting local state", err)
			// TODO: how to handle errors
			return nil
		}
		return &contracts.StateMachineTransition{
			Id:     id,
			State:  contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON,
			Reason: "received user request, commanding on locally",
			TimeMs: time.Now().UnixMilli(),
			PlugId: p.plugID,
		}
	}

	// // TODO: this will only be able to be created by the listener to the return channel from the rpis
	// if p.state == contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON {
	// 	return &contracts.StateMachineTransition{
	// 		Id:     id,
	// 		State:  contracts.StateMachineState_StateMachineState_ON,
	// 		Reason: "mocking the local on change. TODO: perform the change on the rpi and report back",
	// 		TimeMs: time.Now().UnixMilli(),
	// 		PlugId: p.plugID,
	// 	}
	// }

	if p.state == contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF {

		err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_OFF)
		if err != nil {
			log.Println("got error requesting local state", err)
			// TODO: how to handle errors
			return nil
		}
		return &contracts.StateMachineTransition{
			Id:     id,
			State:  contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF,
			Reason: "received user request, commanding off locally",
			TimeMs: time.Now().UnixMilli(),
			PlugId: p.plugID,
		}
	}

	// // TODO: this will only be able to be created by the listener to the return channel from the rpis
	// if p.state == contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF {
	// 	return &contracts.StateMachineTransition{
	// 		Id:     id,
	// 		State:  contracts.StateMachineState_StateMachineState_OFF,
	// 		Reason: "mocking the local off change. TODO: perform the change on the rpi and report back",
	// 		TimeMs: time.Now().UnixMilli(),
	// 		PlugId: p.plugID,
	// 	}
	// }

	// swap state if haven't transitioned in 5 minutes
	if p.transitions[p.latestStatePtr] == nil {
		id := uuid.New().String()
		return &contracts.StateMachineTransition{
			Id:     id,
			State:  contracts.StateMachineState_StateMachineState_ON,
			Reason: "first transition, turning on",
			TimeMs: time.Now().UnixMilli(),
			PlugId: p.plugID,
		}
	}
	lastTransitionTime := time.UnixMilli(p.transitions[p.latestStatePtr].TimeMs)

	if !lastTransitionTime.Before(time.Now().Add(-60 * time.Second)) {
		return nil
	}
	nextState := contracts.StateMachineState_StateMachineState_ON
	if p.transitions[p.latestStatePtr].State == contracts.StateMachineState_StateMachineState_ON {
		nextState = contracts.StateMachineState_StateMachineState_OFF
	}
	return &contracts.StateMachineTransition{
		Id:     id,
		State:  nextState,
		Reason: "auto switching state to demo state machine",
		TimeMs: time.Now().UnixMilli(),
		PlugId: p.plugID,
	}

}

func (p *PlugStateMachine) PerformTransition(ctx context.Context, fs *firestore.Client, transition *contracts.StateMachineTransition) error {
	log.Println("got state transition", transition.GetState(), transition.Reason)
	p.state = transition.GetState()
	nextStatePtr := (p.latestStatePtr + 1) % statesToStore
	p.transitions[nextStatePtr] = transition
	p.latestStatePtr = nextStatePtr
	log.Println("updating pointer", nextStatePtr)

	_, err := fs.Collection(common.CollectionPlugStatus).Doc(p.plugID).Update(ctx, []firestore.Update{
		{Path: "state", Value: transition},
	})

	return err
}

func (p *PlugStateMachine) ValidateCustomerRequest(request *contracts.UserRequest) *contracts.StateMachineTransition {
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

	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	telemetrySub := client.Subscription(telemetryTopicName)
	commandResultsSub := client.Subscription(commandResultsTopicName)

	// commandResultsSub.

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
		stateMachines[plugStatus.GetId()] = InitPlugStateMachine(client, plugStatus.GetSiteId(), plugStatus.GetLatestReading())
	}

	// TODO: get all the plugs from plug settings to make startup much quicker

	// listen to user requests
	userRequests := fs.Collection(common.CollectionUserRequests)
	query := userRequests.Where("result.status", "==", 1)
	iter := query.Snapshots(ctx)
	defer iter.Stop()

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

			// Handle document changes
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
					fmt.Printf("Received new user request: %+v: %s\n", userRequest.PlugId, userRequest.RequestedState)

					transition := plugStateMachine.ValidateCustomerRequest(userRequest)
					if transition == nil {
						log.Println("no transition possible")
					}

					resRequestResult := &contracts.UserRequestResult{
						TimeEnteredState: time.Now().UnixMilli(),
						Status:           contracts.UserRequestStatus_RequestedStatus_SUCCESS,
					}

					// update the firestore doc and then the state machine
					// todo: do these as a batch
					_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
						{Path: "result", Value: resRequestResult},
					})
					err = change.Doc.DataTo(&userRequest)
					if err != nil {
						fmt.Printf("Error updating userrequestresult: %v\n", err)
						continue
					}

					err = plugStateMachine.PerformTransition(ctx, fs, transition)
					if err != nil {
						fmt.Printf("Error performing transition: %v\n", err)
						continue
					}

				}
			}
		}
	}()

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

				stateMachinesMu.Lock()
				plugStateMachine, ok := stateMachines[reading.PlugId]
				stateMachinesMu.Unlock()
				if !ok {
					// TODO: alert on this, shouldn't be adding new plugs often
					log.Println("couldn't find plug", reading.PlugId)
					plugStateMachine = InitPlugStateMachine(client, chunk.GetSiteId(), reading)

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

				plugStateMachine.accumulatedEnergyUsage += reading.Energy

				if nextPtr == 0 {
					// TODO: implement
					log.Println("charging customer for energy usage:", plugStateMachine.accumulatedEnergyUsage)
					plugStateMachine.accumulatedEnergyUsage = 0
				}

				transition := plugStateMachine.DetectTransition(ctx)
				if transition == nil {
					return
				}

				err = plugStateMachine.PerformTransition(ctx, fs, transition)
				if err != nil {
					log.Println("had an error performing transition", err)
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

func InitPlugStateMachine(pubsubClient *pubsub.Client, siteID string, reading *contracts.Reading) *PlugStateMachine {
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
	}

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

	// Process the ReadingChunk
	fmt.Printf("Received readings for site: %s %d\n", readingChunk.SiteId, len(readingChunk.Readings))

	// Acknowledge the message
	msg.Ack()

	return &readingChunk, nil
}
