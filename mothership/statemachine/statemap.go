package statemachine

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
	"github.com/brensch/charging/mothership/session"
	"github.com/brensch/charging/payments"
	"github.com/google/uuid"
)

const (
	dummyChargeDuration = 1 * time.Hour
)

var (
	// note do not lock stateMu inside DoTransition since it's already locked during execution
	StateMap = map[contracts.StateMachineState][]StateTransition{
		contracts.StateMachineState_StateMachineState_INITIALISING: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_NULL,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					p.detailsMu.Lock()
					owner := p.details.CurrentOwner
					p.detailsMu.Unlock()
					return owner == ""
				},
			},
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_ADDED,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					p.detailsMu.Lock()
					owner := p.details.CurrentOwner
					p.detailsMu.Unlock()
					return owner != ""
				},
			},
		},
		contracts.StateMachineState_StateMachineState_ACCOUNT_NULL: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_ADDED,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					p.detailsMu.Lock()
					owner := p.details.CurrentOwner
					p.detailsMu.Unlock()

					ownerExists := owner != ""
					if !ownerExists {
						return false
					}

					// create a new session
					p.detailsMu.Lock()
					p.details.SessionId = uuid.New().String()
					p.detailsMu.Unlock()
					err := p.updateSession(ctx, contracts.SessionEventType_SessionEventType_START)
					if err != nil {
						log.Println("got error updating session", err)
						return false
					}

					return true
				},
				AsyncOnly:  true,
				UserPrompt: "Enable Socket",
			},
		},
		contracts.StateMachineState_StateMachineState_ACCOUNT_ADDED: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_ENTERING_QUEUE,
			},
			manuallyDisableSocket,
		},
		contracts.StateMachineState_StateMachineState_ENTERING_QUEUE: {
			creditCheck,
			{
				TargetState: contracts.StateMachineState_StateMachineState_IN_QUEUE,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					err := p.SetQueueEnteredMs(ctx, time.Now().UnixMilli())
					if err != nil {
						log.Println("failed to set queue entered time", err)
						return false
					}
					return true
				},
			},
			manuallyDisableSocket,
		},
		contracts.StateMachineState_StateMachineState_IN_QUEUE: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_SENSING_START_REQUESTED,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					p.detailsMu.Lock()
					queueEnteredTime := p.details.ChargeStartTimeMs
					p.detailsMu.Unlock()
					// TODO: gigabrain queue logic.
					// currently just wait 5 seconds
					return time.Now().UnixMilli()-queueEnteredTime > 5000
				},
			},
			manuallyDisableSocket,
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
			{
				TargetState: contracts.StateMachineState_StateMachineState_SENSING_START_NOT_RESPONDING,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {

					log.Println("checking if sensing start request expired")
					// enter this state if we failed to transition in 60 seconds
					if p.state.State == contracts.StateMachineState_StateMachineState_SENSING_START_ISSUED_LOCALLY &&
						time.Since(time.UnixMilli(p.state.TimeMs)) > 60*time.Second {
						return true
					}
					return false
				},
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

					chargeCommenced := latestReading.Current > 5
					if chargeCommenced {
						err := p.SetChargeStartTimeMs(ctx, time.Now().UnixMilli())
						if err != nil {
							log.Println("failed to set charge start time", err)
							return false
						}
					}

					return chargeCommenced
				},
			},
			manuallyDisableSocket,
		},
		contracts.StateMachineState_StateMachineState_CHARGING: {
			creditCheck,
			{
				TargetState: contracts.StateMachineState_StateMachineState_CHARGE_COMPLETE,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
					// initializing telemetry still
					if p.latestReadingPtr == -1 {
						return false
					}

					p.latestReadingMu.Lock()
					defer p.latestReadingMu.Unlock()

					var totalPower float64
					var validReadings int

					// Sum all readings and count the non-null readings
					for _, reading := range p.latestReadings {
						if reading != nil { // assuming nil checks for non-null readings
							totalPower += reading.Current * reading.Voltage
							validReadings++
						}
					}

					// Calculate the average power
					averagePower := totalPower / float64(validReadings)
					if validReadings < 20 {
						return false
					}

					// Return true if the average power is below 10W
					return averagePower < 10
				},
			},

			manuallyDisableSocket,
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
			accountNullTransition,
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_NOT_RESPONDING,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {

					log.Println("checking if account removal request expired")
					// enter this state if we failed to transition in 60 seconds
					if p.state.State == contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY &&
						time.Since(time.UnixMilli(p.state.TimeMs)) > 60*time.Second {
						return true
					}
					return false
				},
			},
		},
		contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_NOT_RESPONDING: {
			accountNullTransition,
			{
				TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_REQUESTED,
				AsyncOnly:   true,
				UserPrompt:  "Request Disable Again",
			},
		},
		contracts.StateMachineState_StateMachineState_SENSING_START_NOT_RESPONDING: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_SENSING_START_REQUESTED,
				AsyncOnly:   true,
				UserPrompt:  "Request Enable Again",
			},
		},
		contracts.StateMachineState_StateMachineState_INSUFFICIENT_CREDIT: {
			{
				TargetState: contracts.StateMachineState_StateMachineState_CHARGE_COMPLETE,
				DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {

					log.Println("user ran out of credit")
					// TODO: email or something

					return true
				},
			},
		},
	}

	manuallyDisableSocket = StateTransition{
		TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_REMOVAL_REQUESTED,
		UserPrompt:  "Disable Socket",
		AsyncOnly:   true,
	}

	creditCheck = StateTransition{
		TargetState: contracts.StateMachineState_StateMachineState_INSUFFICIENT_CREDIT,
		DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {

			p.detailsMu.Lock()
			customerID := p.details.CurrentOwner
			sessionID := p.details.SessionId
			lastCreditCheck := p.details.LastCreditCheckMs
			p.detailsMu.Unlock()

			// skip if it's been less than 5 minutes since last check
			start := time.Now()
			if time.Now().UnixMilli()-lastCreditCheck < 60*1000 {
				return false
			}

			// gather the credit and cost of current session
			customerBalance, err := session.GetBalance(ctx, p.fs, customerID)
			if err != nil {
				log.Println("failed to get customer balance", err)
				return false
			}

			currentSession, err := session.CalculateSession(ctx, p.ifClient, sessionID)
			if err != nil {
				log.Println("failed to get current session cost", err)
				return false
			}
			log.Println("credit check", currentSession.Cents, customerBalance.CentsAud)

			err = p.SetLastCreditCheckTime(ctx, start.UnixMilli())
			if err != nil {
				log.Println("failed to set last credit check time", err)
				return false
			}

			return currentSession.Cents >= customerBalance.CentsAud

		},
	}

	// the end of a session, all payment stuff should be done here
	accountNullTransition = StateTransition{
		TargetState: contracts.StateMachineState_StateMachineState_ACCOUNT_NULL,
		AsyncOnly:   true,
		DoTransition: func(ctx context.Context, p *PlugStateMachine) bool {
			// remove old session
			err := p.updateSession(ctx, contracts.SessionEventType_SessionEventType_FINISH)
			if err != nil {
				log.Println("got error updating session", err)
				return false
			}
			p.detailsMu.Lock()
			sessionToCheck := p.details.SessionId
			customer := p.details.CurrentOwner
			p.detailsMu.Unlock()

			calculatedSession, err := session.CalculateSession(ctx, p.ifClient, sessionToCheck)
			if err != nil {
				log.Println("failed to get session", err)
				return false
			}

			err = session.UpdateBalance(ctx, p.fs, calculatedSession)
			if err != nil {
				log.Println("failed to subtract session balance. critical error", err)
				return false
			}

			_, err = p.fs.Collection("sessions").Doc(sessionToCheck).Set(ctx, calculatedSession)
			if err != nil {
				log.Println("failed to write session", err)
				return false
			}

			err = p.ResetStateMachineDetails(ctx)
			if err != nil {
				log.Println("failed to reset state machine details", err)
				return false
			}

			// zero last credit check time so it triggers straight away on new transition
			err = p.SetLastCreditCheckTime(ctx, 0)
			if err != nil {
				log.Println("failed to set last credit check time", err)
				return false
			}

			// try to top up customer with their prepaid settings
			// note current behaviour is to kill their session, then top them up.
			// Don't want to get into making the session top them up as they go since that has the possibility
			// for tricky edge conditions with multiple plugs on a single account active at one time.
			// note should return true here since it's not a failure we can't recover from in the UI doing manual topup

			// get topup preferences
			var topupPreferences *contracts.AutoTopupPreferences
			topupPreferencesDoc, err := p.fs.Collection(payments.FsCollAutoTopupPreferences).Doc(customer).Get(ctx)
			if err != nil {
				log.Println("failed to get customer topup preferences", err)
				return true
			}
			err = topupPreferencesDoc.DataTo(&topupPreferences)
			if err != nil {
				log.Println("failed to charge customer after session", err)
				return true
			}

			// get customer balance
			// gather the credit and cost of current session
			customerBalance, err := session.GetBalance(ctx, p.fs, customer)
			if err != nil {
				log.Println("failed to get customer balance", err)
				return false
			}

			log.Println("checking if we should recharge",
				topupPreferences.Enabled,
				customerBalance.CentsAud,
				topupPreferences.ThresholdCents,
				!topupPreferences.Enabled || customerBalance.CentsAud < topupPreferences.ThresholdCents,
			)

			if !topupPreferences.Enabled || customerBalance.CentsAud > topupPreferences.ThresholdCents {
				return true
			}

			// this tops up their balance
			fmt.Println("topping up balance")
			err = payments.ChargeCustomer(ctx, p.fs, &contracts.PaymentRequest{
				FirestoreId: customer,
				AmountAud:   topupPreferences.RechargeValueCentsAud,
			})
			if err != nil {
				log.Println("failed to charge customer after session", err)
			}

			return true
		},
	}
)
