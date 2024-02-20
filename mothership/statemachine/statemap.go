package statemachine

import (
	"context"
	"log"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
)

var (
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

					p.mu.Lock()
					latestReading := p.latestReadings[p.latestReadingPtr]
					p.mu.Unlock()

					return latestReading.Current > 0
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

					p.mu.Lock()
					latestReading := p.latestReadings[p.latestReadingPtr]
					p.mu.Unlock()

					return latestReading.Current > 0
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

					p.mu.Lock()
					p.currentOwner = ""
					p.mu.Unlock()
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

		// contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF: {
		// 	{
		// 		TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF,
		// 		DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
		// 			err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_OFF)
		// 			if err != nil {
		// 				log.Println("got error requesting local state", err)
		// 				p.Error(err)
		// 				return false
		// 			}
		// 			return true
		// 		},
		// 		ConditionExplanation: "Wait for device response after issuing local command",
		// 	},
		// },
		// contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF: {
		// 	{
		// 		TargetState: contracts.StateMachineState_StateMachineState_OFF,
		// 		AsyncOnly:   true,
		// 	},
		// },
		// contracts.StateMachineState_StateMachineState_OFF: {
		// 	{
		// 		TargetState:          contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON,
		// 		AsyncOnly:            true,
		// 		ConditionExplanation: "User requested ON",
		// 	},
		// },
		// contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON: {
		// 	{
		// 		TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON,
		// 		DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
		// 			err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_ON)
		// 			if err != nil {
		// 				log.Println("got error requesting local state", err)
		// 				p.Error(err)
		// 				return false
		// 			}
		// 			return true
		// 		},
		// 		ConditionExplanation: "Wait for device response after issuing local command",
		// 	},
		// },
		// contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON: {
		// 	{
		// 		TargetState: contracts.StateMachineState_StateMachineState_ON,
		// 		AsyncOnly:   true,
		// 	},
		// },
		// contracts.StateMachineState_StateMachineState_ON: {
		// 	{
		// 		TargetState:          contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF,
		// 		AsyncOnly:            true,
		// 		ConditionExplanation: "User requested OFF",
		// 	},
		// },
	}
)
