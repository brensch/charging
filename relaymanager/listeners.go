package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"

	"cloud.google.com/go/pubsub"
)

func ListenForCommands(ctx context.Context, ps *pubsub.Client, clientID string, plugs map[string]electrical.Plug) {

	commandRequestTopicName := fmt.Sprintf("commands_%s", clientID)
	commandResultsTopic := ps.Topic(common.TopicNameCommandResults)

	// set up commandRequestTopic
	_, commandRequestSub, err := common.EnsureTopicAndSub(ctx, ps, commandRequestTopicName)
	if err != nil {
		log.Fatalf("Failed to create topic: %v", err)
	}

	// listen to commandRequestSub
	err = commandRequestSub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		// request, err := ReceiveCommandRequest(ctx, msg)
		request := &contracts.LocalStateRequest{}
		err := common.UnpackData(msg.Data, request)
		if err != nil {
			log.Printf("Failed to read message: %v", err)
			return
		}
		if err != nil {
			log.Println("failed to unpack request")
			return
		}

		plug, ok := plugs[request.PlugId]
		if !ok {
			log.Println("could not find plug id", request.PlugId)
			return
		}

		requestJSON, _ := json.Marshal(request)
		log.Printf("received command: %s", string(requestJSON))

		err = plug.SetState(request.GetRequestedState())
		if err != nil {
			log.Println("failed to set state", err)
			return
		}

		response := &contracts.LocalStateResponse{
			ReqId:          request.Id,
			ResultantState: request.GetRequestedState(),
			PlugId:         request.GetPlugId(),
			SiteId:         request.GetSiteId(),
			Time:           time.Now().UnixMilli(),
		}
		responseBytes, err := common.PackData(response)
		if err != nil {
			log.Println("failed to send response to command")
			return
		}
		res := commandResultsTopic.Publish(ctx, &pubsub.Message{
			Data: []byte(responseBytes),
		})

		_, err = res.Get(ctx)
		if err != nil {
			log.Println("failed to set command result", err)
			return
		}
		log.Printf("completed and acknowledged command")
		msg.Ack()
	})
	if err != nil {
		log.Fatal("wtf", err)
	}
}
