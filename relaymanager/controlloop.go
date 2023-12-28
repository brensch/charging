package main

import (
	"fmt"
	"log"

	"github.com/brensch/charging/gen/go/contracts"
)

func ControlLoop(localPlugs []*LocalPlugState, localFuzes []*LocalFuzeState, readingsCHAN chan *contracts.Reading) {
	fmt.Println("running control loop")

	// get all plug readings
	var readings []*contracts.Reading
	for _, localPlug := range localPlugs {
		fmt.Println(localPlug.settingsReceiver.GetLatest().GetId())

		reading, err := localPlug.plug.GetReading()
		if err != nil {
			log.Println("failed to get reading", err)
			continue
		}

		readings = append(readings, reading)
		// publish to chan for immediate flushing if required
		readingsCHAN <- reading

	}

	// find fuzes exceeding limits
	for _, fuze := range localFuzes {
		// sum current from all readings belonging to a fuze
		fuzeTotalCurrent := 0.0
		for _, reading := range readings {
			if reading.GetFuzeId() != fuze.fuze.ID() {
				continue
			}
			fuzeTotalCurrent += reading.Current
		}

		if fuzeTotalCurrent > fuze.settingsReceiver.GetLatest().CurrentLimit {
			// TODO: figure out what to do when fuze exceeded
			log.Printf("fuze %s exceeded current limit of %f with current of %f", fuze.fuze.ID(), fuze.settingsReceiver.GetLatest().CurrentLimit, fuzeTotalCurrent)
		}
	}

}
