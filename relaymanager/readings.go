package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"log"

	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/protobuf/proto"
)

func GetReadings(ctx context.Context, plugs []electrical.Plug) ([]*contracts.Reading, error) {
	log.Println("reading meters")

	// get all plug readings
	var readings []*contracts.Reading
	var finalErr error
	for _, plug := range plugs {

		reading, err := plug.GetReading()
		if err != nil {
			log.Println("failed to get reading", err)
			finalErr = errors.Join(finalErr, err)
		}

		readings = append(readings, reading)
	}

	return readings, finalErr

}

func SendReadings(ctx context.Context, topic *pubsub.Topic, siteID string, readings []*contracts.Reading) error {
	readingChunk := &contracts.ReadingChunk{
		SiteId:   siteID,
		Readings: readings,
	}

	readingChunkBytes, err := proto.Marshal(readingChunk)
	if err != nil {
		return err
	}

	// Create a buffer to hold the compressed data
	var b bytes.Buffer
	gz := gzip.NewWriter(&b)

	// Compress the data
	_, err = gz.Write(readingChunkBytes)
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
