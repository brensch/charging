package statemachine

import (
	"context"
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
