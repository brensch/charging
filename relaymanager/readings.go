package main

import (
	"context"
	"errors"
	"log"

	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
)

func GetReadings(ctx context.Context, plugs map[string]electrical.Plug) ([]*contracts.Reading, error) {

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
