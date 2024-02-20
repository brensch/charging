package main

import (
	"context"
	"log"

	"github.com/brensch/charging/gen/go/contracts"
)

var (
	stateMap = map[contracts.StateMachineState][]StateTransition{
		contracts.StateMachineState_StateMachineState_INITIALISING: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_OFF,
			},
		},
		contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
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
		contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_OFF,
				AsyncOnly:   true,
			},
		},
		contracts.StateMachineState_StateMachineState_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON,
				AsyncOnly:   true,
			},
		},
		contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON,
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
		contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ON,
				AsyncOnly:   true,
			},
		},
		contracts.StateMachineState_StateMachineState_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF,
				AsyncOnly:   true,
			},
		},
	}
)
