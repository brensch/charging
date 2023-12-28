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

	siteID string
}

func (s *Plug) ID() string {
	return fmt.Sprintf("demo:%s:%d", s.Mac, s.SwitchNumber)
}

func (s *Plug) SiteID() string {
	return s.siteID
}

func (s *Plug) SetState(req contracts.RequestedState) error {
	log.Println("setting demo plug state: ", req.String())
	return nil
}

func (s *Plug) GetReading() (*contracts.Reading, error) {
	rand.Seed(time.Now().UnixNano())

	// Generate random values for each field
	state := contracts.ActualState(rand.Intn(4) + 1) // Assuming there are 4 states (0 to 3)
	current := rand.Float64() * 100                  // Random current in watts
	voltage := rand.Float64() * 240                  // Random voltage in volts
	powerFactor := rand.Float64()*2 - 1              // Random power factor between -1 and 1
	timestamp := time.Now().Unix()                   // Current timestamp
	energy := rand.Float64() * 1000                  // Random energy in kWh
	plugId := s.ID()

	return &contracts.Reading{
		State:       state,
		Current:     current,
		Voltage:     voltage,
		PowerFactor: powerFactor,
		Timestamp:   timestamp,
		Energy:      energy,
		PlugId:      plugId,
	}, nil
}
