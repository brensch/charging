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

	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/google/uuid"
	"google.golang.org/protobuf/proto"
)

const (
	keyFile        = "./testprovision.key"
	subscriptionID = "test_topic-sub"

	secondsToStore = 10
	statesToStore  = 100
)

type SiteStateMachine struct {
	plugStateMachines map[string]*PlugStateMachine
	mu                sync.Mutex
}

type PlugStateMachine struct {
	plugID string

	latestReadingPtr int
	latestReadings   []*contracts.Reading

	latestStatePtr int
	state          contracts.StateMachineState
	transitions    []*contracts.StateMachineTransition
}

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

	if lastTransitionTime.Before(time.Now().Add(-5 * time.Second)) {
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

	return nil
}

func main() {
	ctx := context.Background()
	projectID, _, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	sub := client.Subscription(subscriptionID)

	// when a chunk comes in it belongs to a single site.
	// store a map of siteids with all the readings from each site for the state machine
	stateMap := make(map[string]*SiteStateMachine)

	var mu sync.Mutex
	err = sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		mu.Lock()
		defer mu.Unlock()

		chunk, err := UnpackMessage(ctx, msg)
		if err != nil {
			log.Println("Failed to read message: %v", err)
			return
		}

		stateMachine, ok := stateMap[chunk.SiteId]
		if !ok {
			log.Println("no state machine for chunk. creating.", chunk.SiteId)
			stateMachine = InitSiteStateMachine(chunk)
			stateMap[chunk.GetSiteId()] = stateMachine
		}

		stateMachine.mu.Lock()
		for _, reading := range chunk.Readings {
			plugStateMachine, ok := stateMachine.plugStateMachines[reading.PlugId]
			if !ok {
				// TODO: handle properly
				fmt.Println("couldn't find plug", reading.PlugId)
				continue
			}

			nextPtr := (plugStateMachine.latestReadingPtr + 1) % secondsToStore
			plugStateMachine.latestReadings[nextPtr] = reading
			plugStateMachine.latestReadingPtr = nextPtr

			transition := plugStateMachine.DetectTransition()
			if transition == nil {
				continue
			}
			log.Println("got state transition", transition.GetState(), transition.Reason)
			plugStateMachine.state = transition.GetState()
			nextStatePtr := (plugStateMachine.latestStatePtr + 1) % statesToStore
			plugStateMachine.transitions[nextStatePtr] = transition
			plugStateMachine.latestStatePtr = nextStatePtr
			fmt.Println("updating pointer", nextStatePtr)
		}
		stateMachine.mu.Unlock()

		// assuming all readings should be greater than

	})

	if err != nil {
		log.Fatalf("Failed to receive messages: %v", err)
	}
}

func InitSiteStateMachine(chunk *contracts.ReadingChunk) *SiteStateMachine {

	stateMachine := &SiteStateMachine{
		plugStateMachines: make(map[string]*PlugStateMachine),
	}

	// can guarantee only a single reading from each plug per chunk
	for _, reading := range chunk.Readings {
		// start a plug state machine for each
		stateMachine.plugStateMachines[reading.PlugId] = InitPlugStateMachine(reading)

	}
	return stateMachine
}

func InitPlugStateMachine(reading *contracts.Reading) *PlugStateMachine {

	latestReadings := make([]*contracts.Reading, secondsToStore)
	latestReadings[0] = reading

	transitions := make([]*contracts.StateMachineTransition, statesToStore)

	stateMachine := &PlugStateMachine{
		plugID:           reading.GetPlugId(),
		latestReadingPtr: 0,
		latestReadings:   latestReadings,
		transitions:      transitions,
	}

	return stateMachine
}

func UnpackMessage(ctx context.Context, msg *pubsub.Message) (*contracts.ReadingChunk, error) {
	fmt.Println("Received a message")

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
