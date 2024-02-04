package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/electrical/demo"
	"github.com/brensch/charging/electrical/shelly"
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
	keyFile   = "./testprovision.key"

	readingsBufferSize = 500
	readingsCollection = "readings"

	topicID = "test_topic"
)

func main() {
	ctx := context.Background()

	projectID, clientID, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	log.Println("got pubsub client")

	sendTopic := client.Topic(topicID)

	fmt.Println(clientID, projectID)
	receiveTopicName := fmt.Sprintf("commands_%s", clientID)

	// set up topic
	topic, err := client.CreateTopic(ctx, receiveTopicName)
	if err != nil {
		// Check if the error is because the topic already exists
		if status.Code(err) == codes.AlreadyExists {
			log.Printf("Topic %s already exists\n", receiveTopicName)
			topic = client.Topic(receiveTopicName)
		} else {
			log.Fatalf("Failed to create topic: %v", err)
		}
	} else {
		log.Printf("Topic %s created\n", receiveTopicName)
	}

	sub, err := client.CreateSubscription(ctx, receiveTopicName, pubsub.SubscriptionConfig{
		Topic:                     topic,
		AckDeadline:               10 * time.Second,
		RetentionDuration:         7 * 24 * time.Hour,
		EnableMessageOrdering:     true,
		EnableExactlyOnceDelivery: true,
		ExpirationPolicy:          time.Duration(0),
	})
	if err != nil {
		// Check if the error is because the topic already exists
		if status.Code(err) == codes.AlreadyExists {
			log.Printf("Sub %s already exists\n", receiveTopicName)
			sub = client.Subscription(receiveTopicName)

		} else {
			log.Fatalf("Failed to create subscription: %v", err)
		}
	} else {
		log.Printf("Subscription %s created\n", receiveTopicName)
	}

	go func() {

		err = sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
			fmt.Println("got messssssssage", msg.Data)
		})
		if err != nil {
			log.Fatal("wtf", err)
		}
	}()

	// // Set up Firestore client
	// fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	// if err != nil {
	// 	log.Fatalf("Failed to create Firestore client: %v", err)
	// }
	// defer fs.Close()

	// err = ensureSiteSettingsDoc(ctx, fs, clientID)
	// if err != nil {
	// 	log.Fatalf("failed to ensure site settings: %+v", err)
	// }

	discoverers := []electrical.Discoverer{
		shelly.InitShellyDiscoverer(clientID),
		demo.InitDiscoverer(clientID),
		// as we make more plug brands we can add their discoverers here.
	}

	plugs := make([]electrical.Plug, 0)
	fuzes := make([]electrical.Fuze, 0)
	for _, discoverer := range discoverers {
		fmt.Println("discovering")
		discoveredPlugs, discoveredFuzes, err := discoverer.Discover()
		if err != nil {
			log.Fatalf("Failed to discover plugs: %v", err)
		}
		plugs = append(plugs, discoveredPlugs...)
		fuzes = append(fuzes, discoveredFuzes...)
	}
	fmt.Println("finished discovering")

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
		for _, reading := range readings {
			fmt.Println("got reading", reading.Voltage)
		}
		err = SendReadings(ctx, sendTopic, clientID, readings)
		if err != nil {
			fmt.Println("failed to send readings")
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
