package demo

import (
	"fmt"
	"log"
	"math/rand"
	"sync"
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

	lastCurrent          float64
	lastSessionStartedMs int64

	mu sync.Mutex
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
	s.mu.Lock()
	defer s.mu.Unlock()
	s.lastSessionStartedMs = time.Now().UnixMilli()
	s.On = req == contracts.RequestedState_RequestedState_ON
	return nil
}

func (s *Plug) GetReading() (*contracts.Reading, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	timestamp := time.Now().UnixMilli() // Current timestamp
	plugId := s.ID()

	state := contracts.ActualState_ActualState_ON
	if !s.On {
		state = contracts.ActualState_ActualState_OFF
		return &contracts.Reading{
			State:       state,
			TimestampMs: timestamp,
			Current:     0,
			Voltage:     0,
			PlugId:      plugId,
			FuzeId:      s.FuzeID(),
		}, nil
	}

	// after 5 hours, ramp to 5w
	targetCurrent := 1000.0

	// Feedback mechanism to tend towards 10000 with less randomness
	variationFactor := 0.01                        // Smaller variation factor for slow adjustment
	randomAdjustment := (rand.Float64() - 0.5) * 2 // Smaller random value between -1 and 1

	// Calculate adjustment based on distance from target with reduced randomness
	current := s.lastCurrent + (targetCurrent-s.lastCurrent)*variationFactor + randomAdjustment*1

	// Ensure the current doesn't drop too low
	if current < 0 {
		current = 0
	}

	if time.Now().UnixMilli()-s.lastSessionStartedMs > 5*60*60*1000 {
		current = 0.02083
	}

	voltage := 240.0
	powerFactor := .7
	s.lastCurrent = current

	return &contracts.Reading{
		State:       state,
		Current:     current,
		Voltage:     voltage,
		PowerFactor: powerFactor,
		TimestampMs: timestamp,
		PlugId:      plugId,
		FuzeId:      s.FuzeID(),
	}, nil
}
