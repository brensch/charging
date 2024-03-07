package statemachine

import (
	"context"
	"fmt"
	"log"
	"sync"

	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/gen/go/contracts"
)

type StateMachineCollection struct {
	stateMachines   map[string]*PlugStateMachine
	stateMachinesMu sync.Mutex
}

func InitStateMachineCollection() *StateMachineCollection {
	return &StateMachineCollection{
		stateMachines: make(map[string]*PlugStateMachine),
	}
}

func (s *StateMachineCollection) GetStateMachine(plugID string) (*PlugStateMachine, bool) {
	s.stateMachinesMu.Lock()
	defer s.stateMachinesMu.Unlock()
	stateMachine, ok := s.stateMachines[plugID]
	return stateMachine, ok
}

func (s *StateMachineCollection) AddStateMachine(stateMachine *PlugStateMachine) {
	s.stateMachinesMu.Lock()
	s.stateMachines[stateMachine.plugID] = stateMachine
	s.stateMachinesMu.Unlock()
}

func (p *PlugStateMachine) WriteReading(ctx context.Context, reading *contracts.Reading, msg *pubsub.Message) error {
	// write latest reading to pointer location in rolling slice
	p.latestReadingMu.Lock()
	nextPtr := (p.latestReadingPtr + 1) % secondsToStore
	p.latestReadings[nextPtr] = reading
	p.latestReadingPtr = nextPtr
	p.latestReadingMu.Unlock()

	// async so ok to do in telemetry loop (ie fast)
	return p.writeReadingToDB(ctx, reading, msg)
}

func (s *StateMachineCollection) PutSiteIntoCommissioningMode(ctx context.Context, siteID, plugToEnable string, commissioning bool) error {

	s.stateMachinesMu.Lock()
	defer s.stateMachinesMu.Unlock()
	plugsFound := false
	for _, stateMachine := range s.stateMachines {
		if stateMachine.siteID != siteID {
			continue
		}
		plugsFound = true
		stateMachine.stateMu.Lock()
		if commissioning {
			stateMachine.state.State = contracts.StateMachineState_StateMachineState_COMMISSIONING
		} else {
			stateMachine.state.State = contracts.StateMachineState_StateMachineState_INITIALISING
		}
		stateMachine.state.Reason = "Technician is commissioning this site."
		stateMachine.stateMu.Unlock()

		// TODO: use latest readings to only tell it off if it's on.
		if stateMachine.plugID != plugToEnable {
			err := stateMachine.RequestLocalState(ctx, contracts.RequestedState_RequestedState_OFF)
			if err != nil {
				log.Println("error requesting local state off", err)
			}
			continue
		}

		err := stateMachine.RequestLocalState(ctx, contracts.RequestedState_RequestedState_ON)
		if err != nil {
			log.Println("error requesting local state on", err)
		}
	}

	if !plugsFound {
		return fmt.Errorf("no plugs found for site %s", siteID)
	}
	return nil
}
