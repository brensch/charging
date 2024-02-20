package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	influxdb2api "github.com/influxdata/influxdb-client-go/v2/api"
	"google.golang.org/api/iterator"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/brensch/charging/mothership/statemachine"
)

func ListenForDeviceCommandResponses(ctx context.Context, fs *firestore.Client, ps *pubsub.Client, stateMachines *statemachine.StateMachineCollection) {

	commandResultsSub := ps.Subscription(common.TopicNameCommandResults)
	err := commandResultsSub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		var response contracts.LocalStateResponse
		err := common.UnpackData(msg.Data, &response)
		if err != nil {
			log.Println("failed to read command response")
			return
		}

		var state contracts.StateMachineState
		// this will need to be able to derive the possible states from the current state of the state machine
		// and pick the right one accordingly
		switch response.ResultantState {
		case contracts.RequestedState_RequestedState_ON:
			state = contracts.StateMachineState_StateMachineState_SENSING_CHARGE
		case contracts.RequestedState_RequestedState_OFF:
			state = contracts.StateMachineState_StateMachineState_ACCOUNT_NULL
		}

		plug, ok := stateMachines.GetStateMachine(response.GetPlugId())
		if !ok {
			fmt.Println("no plug state machine....", response.GetPlugId())
			return
		}

		plug.Transition(ctx, statemachine.StateMap, state)
		// we always want to ack this, or we'll have spurious state commands updating state
		msg.Ack()

	})
	if err != nil {
		log.Fatalf("device command responses listener exited: %+v", err)
	}

}

func ListenForTelemetry(ctx context.Context, fs *firestore.Client, ps *pubsub.Client, ifClientWriteSites influxdb2api.WriteAPI, stateMachines *statemachine.StateMachineCollection) {

	telemetrySub := ps.Subscription(common.TopicNameTelemetry)
	err := telemetrySub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {

		chunk := &contracts.ReadingChunk{}
		err := common.UnpackData(msg.Data, chunk)
		if err != nil {
			log.Printf("Failed to read message: %v", err)
			return
		}

		fmt.Println("got telem from", chunk.SiteId, time.UnixMilli(chunk.Readings[0].TimestampMs))

		for _, reading := range chunk.Readings {
			plugStateMachine, ok := stateMachines.GetStateMachine(reading.PlugId)
			if !ok {
				fmt.Printf("reading: %+v", reading)
				// This should not be happening. may downgrade from fatal though
				log.Fatal("yooo", reading.PlugId, reading.Current)
				return
			}

			err = plugStateMachine.WriteReading(ctx, reading)
			if err != nil {
				log.Println("failed to write reading")
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

func ListenForNewDevices(ctx context.Context, fs *firestore.Client, ps *pubsub.Client, ifdb influxdb2api.WriteAPI, stateMachines *statemachine.StateMachineCollection) {

	_, sub, err := common.EnsureTopicAndSub(ctx, ps, common.TopicNameNewDevices)
	if err != nil {
		log.Fatalf("failed to set up topic and sub: %+v", err)
	}

	sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		deviceAnnouncement := &contracts.DeviceAnnouncement{}
		err := common.UnpackData(msg.Data, deviceAnnouncement)
		if err != nil {
			log.Printf("Failed to read message: %v", err)
			return
		}
		fmt.Println("received device announcement", deviceAnnouncement.SiteId)

		for _, plugID := range deviceAnnouncement.PlugIds {
			_, ok := stateMachines.GetStateMachine(plugID)
			if ok {
				continue
			}
			stateMachines.AddStateMachine(statemachine.InitPlugStateMachine(ctx, fs, ps, ifdb, deviceAnnouncement.SiteId, plugID))
		}

		// send empty response on ack channel to site
		res := ps.
			Topic(fmt.Sprintf(common.TopicNameNewDevicesAck, deviceAnnouncement.SiteId)).
			Publish(ctx, &pubsub.Message{Data: []byte{1}})
		_, err = res.Get(ctx)
		if err != nil {
			log.Printf("failed to ack new devices: %+v", err)
		}

		fmt.Println("acknowledged device announcement", deviceAnnouncement.SiteId)

		msg.Ack()

	})

}

func ListenForUserRequests(ctx context.Context, fs *firestore.Client, stateMachines *statemachine.StateMachineCollection) {
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
			fmt.Printf("Error listening to user request changes: %v\n", err)
			time.Sleep(1 * time.Second)
			continue
		}

		for _, change := range snap.Changes {
			if change.Kind != firestore.DocumentAdded {
				continue
			}
			// Decode the document into the UserRequest struct
			var userRequest *contracts.UserRequest
			err = change.Doc.DataTo(&userRequest)
			if err != nil {
				fmt.Printf("Error decoding document: %v\n", err)
				continue
			}

			// update that we received the request
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

			plugStateMachine, ok := stateMachines.GetStateMachine(userRequest.PlugId)
			if !ok {
				// don't accept errors from users, who knows what nonsense they're up to
				log.Printf("got missing plugid: %s", userRequest.PlugId)
				continue
			}

			// bit of a cludge here, not sure how to unify this with state machine without accepting inputs
			plugStateMachine.SetCurrentOwner(userRequest.UserId)

			// try the transition
			transitioned := plugStateMachine.Transition(ctx, statemachine.StateMap, userRequest.RequestedState)
			if !transitioned {
				// record if the state transition failed
				log.Println("state transition failed", userRequest.GetRequestedState())
				resRequestResult := &contracts.UserRequestResult{
					TimeEnteredState: time.Now().UnixMilli(),
					Status:           contracts.UserRequestStatus_RequestedStatus_FAILURE,
					Reason:           fmt.Sprintf("State %s not valid from %s", userRequest.GetRequestedState(), plugStateMachine.State()),
				}
				_, err = fs.Collection(common.CollectionUserRequests).Doc(userRequest.Id).Update(ctx, []firestore.Update{
					{Path: "result", Value: resRequestResult},
				})
				if err != nil {
					fmt.Printf("Error updating user requests: %v\n", err)
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
