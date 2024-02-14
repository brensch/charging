package main

import (
	"context"
	"log"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
	"github.com/google/uuid"
)

var (
	stateMap = map[contracts.StateMachineState][]StateTransition{
		contracts.StateMachineState_StateMachineState_INITIALISING: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_OFF,
				DetectTransition: func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition {
					// TODO: should actually check to see what the current state of the device is in
					return &contracts.StateMachineTransition{
						Id:      uuid.NewString(),
						State:   contracts.StateMachineState_StateMachineState_OFF,
						Reason:  "off from initialising",
						PlugId:  p.plugID,
						OwnerId: "machine", // todo figure out
						TimeMs:  time.Now().UnixMilli(),
					}
				},
			},
		},
		contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF,
				DetectTransition: func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition {
					err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_OFF)
					if err != nil {
						log.Println("got error requesting local state", err)
						// TODO: how to handle errors
						return nil
					}
					return &contracts.StateMachineTransition{
						Id:      uuid.NewString(),
						State:   contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF,
						Reason:  "sent off command to site",
						PlugId:  p.plugID,
						OwnerId: "machine", // todo figure out
						TimeMs:  time.Now().UnixMilli(),
					}
				},
			},
		},
		contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_OFF,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_OFF {
						log.Println("got wrong state trying to transition to off", p.state)
						return false
					}

					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_OFF: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_OFF {
						log.Println("got wrong state trying to transition to on", p.state)
						return false
					}

					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_USER_REQUESTED_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON,
				DetectTransition: func(ctx context.Context, p *PlugStateMachine) *contracts.StateMachineTransition {
					err := p.RequestLocalState(ctx, contracts.RequestedState_RequestedState_ON)
					if err != nil {
						log.Println("got error requesting local state", err)
						// TODO: how to handle errors
						return nil
					}
					return &contracts.StateMachineTransition{
						Id:      uuid.NewString(),
						State:   contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON,
						Reason:  "sent on command to site",
						PlugId:  p.plugID,
						OwnerId: "machine", // todo figure out
						TimeMs:  time.Now().UnixMilli(),
					}
				},
			},
		},
		contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ON,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_LOCAL_COMMAND_ISSUED_ON {
						log.Println("got wrong state trying to transition to off", p.state)
						return false
					}

					return true
				},
			},
		},
		contracts.StateMachineState_StateMachineState_ON: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_USER_REQUESTED_OFF,
				CheckTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					if p.state != contracts.StateMachineState_StateMachineState_ON {
						log.Println("got wrong state trying to transition to off", p.state)
						return false
					}

					return true
				},
			},
		},
	}
)
