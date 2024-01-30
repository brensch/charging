package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"
	"sync"

	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/protobuf/proto"
)

const (
	keyFile        = "./testprovision.key"
	subscriptionID = "test_topic-sub"
)

type SiteStateMachine struct {
	plugStateMachines map[string]*PlugStateMachine
	mu                sync.Mutex
}

type PlugStateMachine struct {
	plugID            string
	lastReadingTimeMs int64
	reading           *contracts.Reading
	state             contracts.StateMachineState
}

func (p *PlugStateMachine) NextState() contracts.StateMachineState {
	log.Println("updating state of plug", p.plugID, p.state, p.reading.Current)
	return contracts.StateMachineState_StateMachineState_ON
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

		latestChunkTime := int64(0)
		for _, reading := range chunk.Readings {
			if reading.Timestamp > latestChunkTime {
				latestChunkTime = reading.Timestamp
			}
		}
		stateMachine.mu.Lock()
		for _, reading := range chunk.Readings {
			plugStateMachine, ok := stateMachine.plugStateMachines[reading.PlugId]
			if !ok {
				// TODO: handle properly
				fmt.Println("couldn't find plug", reading.PlugId)
				continue
			}

			plugStateMachine.lastReadingTimeMs = reading.GetTimestamp()
			plugStateMachine.reading = reading

			plugStateMachine.state = plugStateMachine.NextState()
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

	stateMachine := &PlugStateMachine{
		plugID:            reading.GetPlugId(),
		lastReadingTimeMs: reading.GetTimestamp(),
		reading:           reading,
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
