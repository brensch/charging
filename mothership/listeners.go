package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	"github.com/google/uuid"
	influxdb2api "github.com/influxdata/influxdb-client-go/v2/api"
	"google.golang.org/api/iterator"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
)

func ListenForDeviceCommandResponses(ctx context.Context, fs *firestore.Client, ps *pubsub.Client, stateMachines *StateMachineCollection) {

	commandResultsSub := ps.Subscription(TopicNameCommandResults)
	err := commandResultsSub.Receive(ctx, func(ctx context.Context, m *pubsub.Message) {
		response, err := ReceiveCommandResponse(ctx, m)
		if err != nil {
			log.Println("failed to read command response")
			return
		}

		var state contracts.StateMachineState
		switch response.ResultantState {
		case contracts.RequestedState_RequestedState_ON:
			state = contracts.StateMachineState_StateMachineState_ON
		case contracts.RequestedState_RequestedState_OFF:
			state = contracts.StateMachineState_StateMachineState_OFF
		}
		// receiving a response from the device indicates we should send the transition regardless
		transition := &contracts.StateMachineTransition{
			Id:     uuid.NewString(),
			State:  state,
			Reason: "device responded to state request",
			TimeMs: time.Now().UnixMilli(),
			PlugId: response.GetPlugId(),
		}

		plug, ok := stateMachines.GetStateMachine(response.GetPlugId())
		if !ok {
			fmt.Println("no plug state machine....", response.GetPlugId())
			return
		}

		err = plug.PerformTransition(ctx, fs, transition)
		if err != nil {
			log.Println("failed to perform transition from locally received state", err)
			return
		}
	})

	// TODO: not this
	panic(err)
}

func ListenForTelemetry(ctx context.Context, fs *firestore.Client, ps *pubsub.Client, ifClientWriteSites influxdb2api.WriteAPI, stateMachines *StateMachineCollection) {

	telemetrySub := ps.Subscription(TopicNameTelemetry)
	err := telemetrySub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {

		chunk := &contracts.ReadingChunk{}
		err := common.UnpackData(ctx, msg.Data, chunk)
		if err != nil {
			log.Println("Failed to read message: %v", err)
			return
		}

		for _, reading := range chunk.Readings {
			plugStateMachine, ok := stateMachines.GetStateMachine(reading.PlugId)
			if !ok {
				// TODO: formalise the adding of a plug rather than doing it as a side effect of receiving telemetry
				// this will mean that the telemetry loop doesn't potentially get hung up on the init step
				// which takes a while due to fs write
				log.Println("couldn't find plug", reading.PlugId)
				plugStateMachine = InitPlugStateMachine(ctx, fs, ps, ifClientWriteSites, chunk.GetSiteId(), reading)

				// this only needs to be done if we receive a non existant plug id from a reading
				err = EnsurePlugIsInFirestore(ctx, fs, chunk.GetSiteId(), reading)
				if err != nil {
					log.Println("failed to init new plug state machine")
					return
				}
				stateMachines.AddStateMachine(plugStateMachine)
			}

			// write latest reading to pointer location in rolling slice
			plugStateMachine.mu.Lock()
			nextPtr := (plugStateMachine.latestReadingPtr + 1) % secondsToStore
			plugStateMachine.latestReadings[nextPtr] = reading
			plugStateMachine.latestReadingPtr = nextPtr
			plugStateMachine.mu.Unlock()

			// async so ok to do in telemetry loop (ie fast)
			err = plugStateMachine.WriteReadingToDB(ctx, reading)
			if err != nil {
				log.Println("failed to write reading to db")
				// want to return here so we don't ack a message that didn't get recorded
				return
			}

		}

		// now we've successfully written to ifdb we can ack.
		// NB we need to be certain that we can flush.
		// we may want to not write async to ensure this
		msg.Ack()

	})

	panic(err)
}

func ListenForNewDevices(ctx context.Context, fs *firestore.Client, ps *pubsub.Client, stateMachines *StateMachineCollection) {

	// TODO
}

func ListenForUserRequests(ctx context.Context, fs *firestore.Client, stateMachines *StateMachineCollection) {
	// listen to user requests
	userRequests := fs.Collection(common.CollectionUserRequests)
	query := userRequests.Where("result.status", "==", 1)
	iter := query.Snapshots(ctx)
	defer iter.Stop()

	// Handle commands coming from document changes
	for {
		// Await the next snapshot.
		snap, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			fmt.Printf("Error listening to changes: %v\n", err)
			continue
		}

		for _, change := range snap.Changes {
			if change.Kind == firestore.DocumentAdded {
				// Decode the document into the UserRequest struct
				var userRequest *contracts.UserRequest
				if err := change.Doc.DataTo(&userRequest); err != nil {
					fmt.Printf("Error decoding document: %v\n", err)
					continue
				}

				plugStateMachine, ok := stateMachines.GetStateMachine(userRequest.PlugId)
				if !ok {
					// don't accept errors from users, who knows what nonsense they're up to
					log.Println("got missing plugid: %s", userRequest.PlugId)
					continue
				}

				availableStates, ok := stateMap[plugStateMachine.state]
				if !ok {
					log.Println("requested invalid state")
					continue
				}

				stateAllowed := false
				for _, state := range availableStates {
					fmt.Println(state.TargetState, userRequest.GetRequestedState())
					if state.TargetState != userRequest.GetRequestedState() {
						continue
					}
					stateAllowed = true
					break
				}

				if !stateAllowed {
					log.Println("state not allowed", userRequest.GetRequestedState())
					resRequestResult := &contracts.UserRequestResult{
						TimeEnteredState: time.Now().UnixMilli(),
						Status:           contracts.UserRequestStatus_RequestedStatus_FAILURE,
						Reason:           fmt.Sprintf("State %s not valid from %s", userRequest.GetRequestedState(), plugStateMachine.state),
					}
					_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
						{Path: "result", Value: resRequestResult},
					})
					if err != nil {
						fmt.Printf("Error updating user requests: %v\n", err)
					}
					continue
				}
				fmt.Printf("Received new user request: %+v: %s\n", userRequest.PlugId, userRequest.RequestedState)

				transition := plugStateMachine.ConvertCustomerRequest(userRequest)
				if transition == nil {
					log.Println("no transition possible")
				}

				// update the document that we received it
				resRequestResult := &contracts.UserRequestResult{
					TimeEnteredState: time.Now().UnixMilli(),
					Status:           contracts.UserRequestStatus_RequestedStatus_RECEIVED,
				}
				_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
					{Path: "result", Value: resRequestResult},
				})
				if err != nil {
					fmt.Printf("Error updating user requests: %v\n", err)
					continue
				}
				err = change.Doc.DataTo(&userRequest)
				if err != nil {
					fmt.Printf("Error updating userrequestresult: %v\n", err)
					continue
				}

				err = plugStateMachine.PerformTransition(ctx, fs, transition)
				if err != nil {
					fmt.Printf("Error performing transition: %v\n", err)
					// update the document that we received it
					resRequestResult = &contracts.UserRequestResult{
						TimeEnteredState: time.Now().UnixMilli(),
						Status:           contracts.UserRequestStatus_RequestedStatus_FAILURE,
					}
					_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
						{Path: "result", Value: resRequestResult},
					})
					if err != nil {
						fmt.Printf("Error updating user requests: %v\n", err)
						continue
					}
					continue
				}

				// update the document that we succeeded
				resRequestResult = &contracts.UserRequestResult{
					TimeEnteredState: time.Now().UnixMilli(),
					Status:           contracts.UserRequestStatus_RequestedStatus_SUCCESS,
				}
				_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
					{Path: "result", Value: resRequestResult},
				})
				if err != nil {
					fmt.Printf("Error updating user requests: %v\n", err)
					continue
				}

			}
		}
	}
}
