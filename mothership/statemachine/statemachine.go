package statemachine

import (
	"fmt"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
)

type State int

// TransitionFunc defines the signature for checking if a transition is allowed.
type TransitionFunc func() bool

// StateTransition defines a possible transition from one state to another with conditions.
type StateTransition struct {
	ToState          contracts.StateMachineState
	ShouldTransition TransitionFunc
	CanTransition    TransitionFunc
}

// StateMachine holds the current state, transitions, and a ticker for periodic checks.
type StateMachine struct {
	CurrentState contracts.StateMachineState
	Transitions  map[contracts.StateMachineState][]StateTransition
	ticker       *time.Ticker
	stopChan     chan struct{}
}

// NewStateMachine initializes a new state machine with transitions and starts the ticker.
func NewStateMachine() *StateMachine {
	sm := &StateMachine{
		CurrentState: contracts.StateMachineState_StateMachineState_OFF, // Use the OFF state as initial state
		Transitions: map[contracts.StateMachineState][]StateTransition{
			contracts.StateMachineState_StateMachineState_OFF: {
				{
					ToState:          contracts.StateMachineState_StateMachineState_ON,
					ShouldTransition: func() bool { return true },
					CanTransition:    func() bool { return true }},
			},
			contracts.StateMachineState_StateMachineState_ON: {
				{
					ToState:          contracts.StateMachineState_StateMachineState_OFF,
					ShouldTransition: func() bool { return true },
					CanTransition:    func() bool { return true }},
			},
			// Define more transitions here as needed
		},
		stopChan: make(chan struct{}),
	}
	sm.startTicker()
	return sm
}

// startTicker starts the ticker that triggers state checks and potential transitions.
func (sm *StateMachine) startTicker() {
	sm.ticker = time.NewTicker(1 * time.Second)

	go func() {
		for {
			select {
			case <-sm.ticker.C:
				sm.checkTransitions()
			case <-sm.stopChan:
				return
			}
		}
	}()
}

// checkTransitions checks for any possible transitions based on current state.
func (sm *StateMachine) FindTransitions() {
	transitions, ok := sm.Transitions[sm.CurrentState]
	if !ok {
		fmt.Println("No transitions available from current state")
		return
	}

	for _, transition := range transitions {
		if transition.ShouldTransition() {
			sm.CurrentState = transition.ToState
			fmt.Printf("Transitioned to new state: %v\n", sm.CurrentState)
			break // Assuming only one transition per check for simplicity
		}
	}
}

// Stop stops the ticker and cleans up resources.
func (sm *StateMachine) Stop() {
	sm.ticker.Stop()
	close(sm.stopChan)
}
