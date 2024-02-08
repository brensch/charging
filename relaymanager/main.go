package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/electrical/shelly"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/api/option"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"cloud.google.com/go/pubsub"
)

const siteName = "brendo pi"
const configFile = "./siteSettings.json"

const (
	port      = ":443"
	configDir = "./config/"
	secretDir = "./secrets/"
	keyFile   = "./gcp.key"

	readingsBufferSize = 500
	readingsCollection = "readings"

	telemetryTopicName      = "telemetry"
	commandResultsTopicName = "command_results"
)

func main() {
	ctx := context.Background()

	projectID, clientID, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	client, err := pubsub.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	log.Println("got pubsub client")

	telemetrySendTopic := client.Topic(telemetryTopicName)
	commandResultsTopic := client.Topic(commandResultsTopicName)

	fmt.Println(clientID, projectID)
	commandRequestTopicName := fmt.Sprintf("commands_%s", clientID)

	// set up commandRequestTopic
	commandRequestTopic, err := client.CreateTopic(ctx, commandRequestTopicName)
	if err != nil {
		// Check if the error is because the topic already exists
		if status.Code(err) == codes.AlreadyExists {
			log.Printf("Topic %s already exists\n", commandRequestTopicName)
			commandRequestTopic = client.Topic(commandRequestTopicName)
		} else {
			log.Fatalf("Failed to create topic: %v", err)
		}
	} else {
		log.Printf("Topic %s created\n", commandRequestTopicName)
	}

	sub, err := client.CreateSubscription(ctx, commandRequestTopicName, pubsub.SubscriptionConfig{
		Topic:                     commandRequestTopic,
		AckDeadline:               10 * time.Second,
		RetentionDuration:         7 * 24 * time.Hour,
		EnableMessageOrdering:     true,
		EnableExactlyOnceDelivery: true,
		ExpirationPolicy:          time.Duration(0),
	})
	if err != nil {
		// Check if the error is because the topic already exists
		if status.Code(err) == codes.AlreadyExists {
			log.Printf("Sub %s already exists\n", commandRequestTopicName)
			sub = client.Subscription(commandRequestTopicName)

		} else {
			log.Fatalf("Failed to create subscription: %v", err)
		}
	} else {
		log.Printf("Subscription %s created\n", commandRequestTopicName)
	}

	discoverers := []electrical.Discoverer{
		shelly.InitShellyDiscoverer(clientID),
		// demo.InitDiscoverer(clientID),
		// as we make more plug brands we can add their discoverers here.
	}

	plugs := make(map[string]electrical.Plug, 0)
	fuzes := make(map[string]electrical.Fuze, 0)
	for _, discoverer := range discoverers {
		fmt.Println("discovering")
		discoveredPlugs, discoveredFuzes, err := discoverer.Discover()
		if err != nil {
			log.Fatalf("Failed to discover plugs: %v", err)
		}
		for _, plug := range discoveredPlugs {
			log.Println("found plug: ", plug.ID())
			plugs[plug.ID()] = plug
		}
		for _, fuze := range discoveredFuzes {
			log.Println("found fuze: ", fuze.ID())
			fuzes[fuze.ID()] = fuze
		}

	}
	fmt.Println("finished discovering")

	// command listening loop
	go func() {

		err = sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
			request, err := ReceiveCommandRequest(ctx, msg)
			if err != nil {
				log.Println("failed to unpack request")
				return
			}

			plug, ok := plugs[request.PlugId]
			if !ok {
				log.Println("could not find plug id", request.PlugId)
				return
			}

			err = plug.SetState(request.GetRequestedState())
			if err != nil {
				log.Println("failed to set state", err)
				return
			}

			response := &contracts.LocalStateResponse{
				ReqId:          request.Id,
				ResultantState: request.GetRequestedState(),
				PlugId:         request.GetPlugId(),
				SiteId:         request.GetSiteId(),
				Time:           time.Now().UnixMilli(),
			}
			err = SendCommandResult(ctx, commandResultsTopic, response)
			if err != nil {
				log.Println("failed to set command result", err)
				return
			}
		})
		if err != nil {
			log.Fatal("wtf", err)
		}
	}()

	ticker := time.NewTicker(1 * time.Second)
	for {
		select {
		case <-ticker.C:
		case <-ctx.Done():
		}
		readings, err := GetReadings(ctx, plugs)
		if err != nil {
			fmt.Println("got error reading readings")
			continue
		}

		err = SendReadings(ctx, telemetrySendTopic, clientID, readings)
		if err != nil {
			fmt.Println("failed to send readings", err)
			continue
		}

	}

}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	s := make([]byte, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}
