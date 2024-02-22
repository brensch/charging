package statemachine

import (
	"context"
	"log"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
)

var (
	// note do not lock stateMu inside DoTransition since it's already locked during execution
	StateMap = map[contracts.StateMachineState][]StateTransition{
		contracts.StateMachineState_StateMachineState_INITIALISING: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_NULL,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					return p.currentOwner == ""
				},
			},
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_ADDED,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					return p.currentOwner != ""
				},
				ConditionExplanation: "can start with account on mothership startup if went offline during session",
			},
		},
		contracts.StateMachineState_StateMachineState_ACCOUNT_NULL: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_ADDED,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					return p.currentOwner != ""
				},
				AsyncOnly: true,
			},
		},
		contracts.StateMachineState_StateMachineState_ACCOUNT_ADDED: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ENTERING_QUEUE,
			},
		},
		contracts.StateMachineState_StateMachineState_ENTERING_QUEUE: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_IN_QUEUE,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					p.queueEnteredMs = time.Now().UnixMilli()
					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_IN_QUEUE: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_SENSING_START_REQUESTED,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					// TODO: gigabrain queue logic.
					// currently just wait 5 seconds
					return time.Now().UnixMilli()-p.queueEnteredMs > 5000
				},
			},
		},
		contracts.StateMachineState_StateMachineState_SENSING_START_REQUESTED: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_SENSING_START_ISSUED_LOCALLY,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_ON)
					if err != nil {
						log.Println("got error requesting local state", err)
						p.Error(err)
						return false
					}
					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_SENSING_START_ISSUED_LOCALLY: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_SENSING_CHARGE,
				AsyncOnly:   true,
			},
		},
		contracts.StateMachineState_StateMachineState_SENSING_CHARGE: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_CHARGING,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					// initialising telemetry still
					if p.latestReadingPtr == -1 {
						return false
					}

					p.latestReadingMu.Lock()
					latestReading := p.latestReadings[p.latestReadingPtr]
					p.latestReadingMu.Unlock()

					chargeCommenced := latestReading.Current > 0

					if chargeCommenced {
						p.chargeStartTime = time.Now()
					}

					return chargeCommenced
				},
			},
		},
		contracts.StateMachineState_StateMachineState_CHARGING: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_CHARGE_COMPLETE,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					// initialising telemetry still
					if p.latestReadingPtr == -1 {
						return false
					}

					p.latestReadingMu.Lock()
					latestReading := p.latestReadings[p.latestReadingPtr]
					p.latestReadingMu.Unlock()

					// if it never goes to 0, also stop after 1 minute
					// TODO: remove time limitation
					return latestReading.Current == 0 || time.Now().After(p.chargeStartTime.Add(1*time.Minute))
				},
			},
		},
		contracts.StateMachineState_StateMachineState_CHARGE_COMPLETE: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_REQUESTED,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {

					// TODO: check preferences
					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_REQUESTED: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {

					p.currentOwner = ""
					err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_OFF)
					if err != nil {
						log.Println("got error requesting local state", err)
						p.Error(err)
						return false
					}
					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_NULL,
				AsyncOnly:   true,
			},
		},
	}
)
