package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"log"

	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/protobuf/proto"
)

func GetReadings(ctx context.Context, localPlugs []*LocalPlugState, localFuzes []*LocalFuzeState) ([]*contracts.Reading, error) {
	log.Println("reading meters")

	// get all plug readings
	var readings []*contracts.Reading
	var finalErr error
	for _, localPlug := range localPlugs {

		reading, err := localPlug.plug.GetReading()
		if err != nil {
			log.Println("failed to get reading", err)
			finalErr = errors.Join(finalErr, err)
		}

		readings = append(readings, reading)
		// publish to chan for immediate flushing if required

	}

	// // find fuzes exceeding limits
	// for _, fuze := range localFuzes {
	// 	// sum current from all readings belonging to a fuze
	// 	fuzeTotalCurrent := 0.0
	// 	for _, reading := range readings {
	// 		if reading.GetFuzeId() != fuze.fuze.ID() {
	// 			continue
	// 		}
	// 		fuzeTotalCurrent += reading.Current
	// 	}

	// 	if fuzeTotalCurrent > fuze.settingsReceiver.GetLatest().CurrentLimit {
	// 		// TODO: figure out what to do when fuze exceeded
	// 		log.Printf("fuze %s exceeded current limit of %f with current of %f", fuze.fuze.ID(), fuze.settingsReceiver.GetLatest().CurrentLimit, fuzeTotalCurrent)
	// 	}
	// }

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
	fmt.Println("size of chunk:", len(readingChunkBytes))

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

	fmt.Println("size of compressed:", len(b.Bytes()))

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
