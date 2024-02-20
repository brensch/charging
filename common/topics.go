package common

import (
	"context"
	"log"
	"time"

	"cloud.google.com/go/pubsub"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	TopicNameTelemetry      = "telemetry"
	TopicNameCommandResults = "command_results"
	TopicNameNewDevices     = "new_devices"
	TopicNameNewDevicesAck  = "ack_new_devices_%s"
)

func EnsureTopicAndSub(ctx context.Context, ps *pubsub.Client, topicName string) (*pubsub.Topic, *pubsub.Subscription, error) {
	// set up commandRequestTopic
	topic, err := ps.CreateTopic(ctx, topicName)
	if err != nil {
		// Check if the error is because the topic already exists
		if status.Code(err) == codes.AlreadyExists {
			log.Printf("Topic %s already exists\n", topicName)
			topic = ps.Topic(topicName)
		} else {
			return nil, nil, err
		}
	} else {
		log.Printf("Topic %s created\n", topicName)
	}

	sub, err := ps.CreateSubscription(ctx, topicName, pubsub.SubscriptionConfig{
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
			log.Printf("Sub %s already exists\n", topicName)
			sub = ps.Subscription(topicName)

		} else {
			log.Fatalf("Failed to create subscription: %v", err)
			return nil, nil, err
		}
	} else {
		log.Printf("Subscription %s created\n", topicName)
	}

	return topic, sub, nil
}
