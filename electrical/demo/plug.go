package demo

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
)

// Plug represents a Shelly plug with its host and switch number.
type Plug struct {
	Host         string
	Mac          string
	SwitchNumber int

	On bool

	siteID string
}

func (s *Plug) ID() string {
	return fmt.Sprintf("demo:%s:%d", s.Mac, s.SwitchNumber)
}

func (s *Plug) FuzeID() string {
	return fmt.Sprintf("demofuze:%s", s.Mac)
}

func (s *Plug) SiteID() string {
	return s.siteID
}

func (s *Plug) SetState(req contracts.RequestedState) error {
	log.Println("setting demo plug state: ", req.String())
	s.On = req == contracts.RequestedState_RequestedState_ON
	return nil
}

func (s *Plug) GetReading() (*contracts.Reading, error) {

	timestamp := time.Now().UnixMilli() // Current timestamp
	plugId := s.ID()

	state := contracts.ActualState_ActualState_ON
	if !s.On {
		state = contracts.ActualState_ActualState_OFF
		return &contracts.Reading{
			State:       state,
			TimestampMs: timestamp,
			PlugId:      plugId,
		}, nil
	}
	// Generate random values for each field
	current := rand.Float64() * 100     // Random current in watts
	voltage := rand.Float64() * 240     // Random voltage in volts
	powerFactor := rand.Float64()*2 - 1 // Random power factor between -1 and 1

	return &contracts.Reading{
		State:       state,
		Current:     current,
		Voltage:     voltage,
		PowerFactor: powerFactor,
		TimestampMs: timestamp,
		PlugId:      plugId,
	}, nil
}
