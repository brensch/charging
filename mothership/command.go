package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"

	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/protobuf/proto"
)

func SendLocalStateRequest(ctx context.Context, topic *pubsub.Topic, request *contracts.LocalStateRequest) error {

	objectBytes, err := proto.Marshal(request)
	if err != nil {
		return err
	}

	// Create a buffer to hold the compressed data
	var b bytes.Buffer
	gz := gzip.NewWriter(&b)

	// Compress the data
	_, err = gz.Write(objectBytes)
	if err != nil {
		return err
	}
	// Close the gzip writer to complete the compression
	err = gz.Close()
	if err != nil {
		return err
	}

	result := topic.Publish(ctx, &pubsub.Message{
		Data: []byte(b.Bytes()),
	})

	sendID, err := result.Get(ctx)
	if err != nil {
		return err
	}

	fmt.Println("sent readings: ", sendID)
	return nil
}

func ReceiveCommandResponse(ctx context.Context, msg *pubsub.Message) (*contracts.LocalStateResponse, error) {

	// Decompress the data
	reader, err := gzip.NewReader(bytes.NewReader(msg.Data))
	if err != nil {
		log.Println("Error creating gzip reader:", err)
		msg.Ack()
		return nil, err
	}
	defer reader.Close()

	decompressedData, err := io.ReadAll(reader)
	if err != nil {
		log.Println("Error reading decompressed data:", err)
		msg.Ack()
		return nil, err
	}

	// Unmarshal the decompressed data into a ReadingChunk
	var localStateRequest contracts.LocalStateResponse
	err = proto.Unmarshal(decompressedData, &localStateRequest)
	if err != nil {
		log.Println("Error unmarshalling data:", err)
		msg.Ack()
		return nil, err
	}

	// Process the ReadingChunk
	fmt.Printf("Received request for plug%s %s\n", localStateRequest.SiteId, localStateRequest.PlugId)

	// Acknowledge the message
	msg.Ack()

	return &localStateRequest, nil
}