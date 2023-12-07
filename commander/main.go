package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const (
	keyFile = "./testprovision.key"
)

func main() {
	ctx := context.Background()

	projectID, clientID, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	fmt.Println(clientID, projectID)

	// Set up Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer fs.Close()

	startCommandService(ctx, fs)

}

func startCommandService(ctx context.Context, fs *firestore.Client) {
	for {
		// Check the plug_settings collection and send commands to each plug
		err := sendRandomCommandsToPlugs(ctx, fs)
		if err != nil {
			log.Printf("Error sending commands: %v", err)
		}

		// Wait for a while before checking again
		time.Sleep(5 * time.Second)
	}
}

func sendRandomCommandsToPlugs(ctx context.Context, fs *firestore.Client) error {
	iter := fs.Collection("plug_settings").Documents(ctx)
	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return err
		}

		plugID := doc.Ref.ID

		// Send a random command
		go func() {

			randomState := getRandomState()
			log.Printf("commanding plug: %s - %s", plugID, randomState.String())
			err = sendCommandToPlug(ctx, fs, plugID, randomState)
			if err != nil {
				log.Printf("Failed to send random command: %v", err)
			}
		}()
	}
	return nil
}

func getRandomState() contracts.RequestedState {
	// Randomly choose between On and Off states
	if rand.Intn(2) == 0 {
		return contracts.RequestedState_RequestedState_ON
	}
	return contracts.RequestedState_RequestedState_OFF
}

func sendCommandToPlug(ctx context.Context, fs *firestore.Client, plugID string, state contracts.RequestedState) error {
	_, _, err := fs.Collection("plug_commands").Add(ctx, contracts.PlugCommand{
		RequestedState: state,
		Reason:         contracts.RequestedStateReason_RequestedStateReason_USER,
		Time:           time.Now().Unix(),
		Requestor:      "service",
		CommandId:      "cmd-" + time.Now().Format("20060102150405"),
		PlugId:         plugID,
	})
	return err
}
