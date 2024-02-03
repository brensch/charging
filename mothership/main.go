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
	keyFile        = "./testprovision.key"
	subscriptionID = "test_topic-sub"

	secondsToStore = 10
	statesToStore  = 100
)

// type SiteStateMachine struct {
// 	plugStateMachines map[string]*PlugStateMachine
// 	mu                sync.Mutex
// }

type PlugStateMachine struct {
	plugID string

	latestReadingPtr int
	latestReadings   []*contracts.Reading

	latestStatePtr int
	state          contracts.StateMachineState
	transitions    []*contracts.StateMachineTransition

	accumulatedEnergyUsage float64

	mu sync.Mutex
}

// this will eventually be a switch thing.
func (p *PlugStateMachine) DetectTransition() *contracts.StateMachineTransition {
	log.Println("checking for transitions", p.plugID, p.state, p.latestReadings[p.latestReadingPtr].Current)

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
	id := uuid.New().String()
	nextState := contracts.StateMachineState_StateMachineState_ON
	if p.transitions[p.latestStatePtr].State == contracts.StateMachineState_StateMachineState_ON {
		nextState = contracts.StateMachineState_StateMachineState_OFF
	}
	return &contracts.StateMachineTransition{
		Id:     id,
		State:  nextState,
		Reason: "switching state",
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
	fmt.Println("updating pointer", nextStatePtr)

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

	sub := client.Subscription(subscriptionID)

	// Set up Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer fs.Close()

	// Collection reference
	userRequests := fs.Collection("user_requests")

	// Create a query for documents within the collection.
	// Adjust the query according to your needs. This example listens to all documents.
	query := userRequests.Query

	// Start listening to query results
	iter := query.Snapshots(ctx)

	defer iter.Stop()

	// when a chunk comes in it belongs to a single site.
	// store a map of siteids with all the readings from each site for the state machine
	stateMachines := make(map[string]*PlugStateMachine)
	var stateMachinesMu sync.Mutex

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
					_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
						{Path: "result", Value: resRequestResult},
					})
					if err := change.Doc.DataTo(&userRequest); err != nil {
						fmt.Printf("Error updating userrequestresult: %v\n", err)
						continue
					}

					// Print out the document contents
				}
			}
		}
	}()

	err = sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		mu.Lock()
		defer mu.Unlock()

		chunk, err := UnpackMessage(ctx, msg)
		if err != nil {
			log.Println("Failed to read message: %v", err)
			return
		}

		for _, reading := range chunk.Readings {
			stateMachinesMu.Lock()
			plugStateMachine, ok := stateMachines[reading.PlugId]
			stateMachinesMu.Unlock()
			if !ok {
				// TODO: alert on this, shouldn't be adding new plugs often
				fmt.Println("couldn't find plug", reading.PlugId)
				plugStateMachine, err = InitPlugStateMachine(ctx, fs, reading)
				if err != nil {
					log.Println("failed to init new plug state machine")
					return
				}
				stateMachinesMu.Lock()
				stateMachines[reading.PlugId] = plugStateMachine
				stateMachinesMu.Unlock()
			}

			fmt.Printf("%f kWh\n", reading.Energy)

			// inline func to ensure unlock
			// TODO: make this better
			func() {
				plugStateMachine.mu.Lock()
				defer plugStateMachine.mu.Unlock()

				nextPtr := (plugStateMachine.latestReadingPtr + 1) % secondsToStore
				plugStateMachine.latestReadings[nextPtr] = reading
				plugStateMachine.latestReadingPtr = nextPtr

				plugStateMachine.accumulatedEnergyUsage += reading.Energy

				if nextPtr == 0 {
					// TODO: implement
					fmt.Println("charging customer for energy usage:", plugStateMachine.accumulatedEnergyUsage)
					plugStateMachine.accumulatedEnergyUsage = 0
				}

				transition := plugStateMachine.DetectTransition()
				if transition == nil {
					return
				}

				err = plugStateMachine.PerformTransition(ctx, fs, transition)
				if err != nil {
					log.Println("had an error performing transition", err)
				}

			}()
		}

	})

	if err != nil {
		log.Fatalf("Failed to receive messages: %v", err)
	}
}

// func InitSiteStateMachine(ctx context.Context, fs *firestore.Client, chunk *contracts.ReadingChunk) (*SiteStateMachine, error) {

// 	err := ensureSiteSettingsDoc(ctx, fs, chunk.GetSiteId())
// 	if err != nil {
// 		return nil, err
// 	}

// 	stateMachine := &SiteStateMachine{
// 		plugStateMachines: make(map[string]*PlugStateMachine),
// 	}

// 	// can guarantee only a single reading from each plug per chunk
// 	for _, reading := range chunk.Readings {
// 		// start a plug state machine for each
// 		stateMachine.plugStateMachines[reading.PlugId], err = InitPlugStateMachine(ctx, fs, reading)
// 		if err != nil {
// 			return nil, err
// 		}

// 	}
// 	return stateMachine, nil
// }

func InitPlugStateMachine(ctx context.Context, fs *firestore.Client, reading *contracts.Reading) (*PlugStateMachine, error) {

	err := ensurePlugSettingsDoc(ctx, fs, reading.GetPlugId())
	if err != nil {
		return nil, err
	}

	err = ensurePlugStatusDoc(ctx, fs, reading.GetPlugId())
	if err != nil {
		return nil, err
	}

	latestReadings := make([]*contracts.Reading, secondsToStore)
	latestReadings[0] = reading

	transitions := make([]*contracts.StateMachineTransition, statesToStore)

	stateMachine := &PlugStateMachine{
		plugID:           reading.GetPlugId(),
		latestReadingPtr: 0,
		latestReadings:   latestReadings,
		transitions:      transitions,
	}

	return stateMachine, nil
}

// func EnsurePlugStatusExists

func UnpackMessage(ctx context.Context, msg *pubsub.Message) (*contracts.ReadingChunk, error) {

	// Decompress the data
	reader, err := gzip.NewReader(bytes.NewReader(msg.Data))
	if err != nil {
		fmt.Println("Error creating gzip reader:", err)
		msg.Nack()
		return nil, err
	}
	defer reader.Close()

	decompressedData, err := io.ReadAll(reader)
	if err != nil {
		fmt.Println("Error reading decompressed data:", err)
		msg.Nack()
		return nil, err
	}

	// Unmarshal the decompressed data into a ReadingChunk
	var readingChunk contracts.ReadingChunk
	err = proto.Unmarshal(decompressedData, &readingChunk)
	if err != nil {
		fmt.Println("Error unmarshalling data:", err)
		msg.Nack()
		return nil, err
	}

	// Process the ReadingChunk
	fmt.Printf("Received readings for site: %s %d\n", readingChunk.SiteId, len(readingChunk.Readings))
	// Add your logic here to process the readings...

	// Acknowledge the message
	msg.Ack()

	return &readingChunk, nil
}
