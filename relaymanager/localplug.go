package main

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/api/iterator"
)

const PlugSettingsCollection = "plug_settings"

type PlugLocalState struct {
	plug             electrical.Plug
	settingsReceiver *Receiver[contracts.PlugSettings]
}

func InitPlugLocalState(ctx context.Context, fs *firestore.Client, plug electrical.Plug) (*PlugLocalState, error) {
	receiver, err := InitReceiver[contracts.PlugSettings](ctx, fs, plug, PlugSettingsCollection)
	if err != nil {
		return nil, err
	}

	plugLocal := &PlugLocalState{
		plug:             plug,
		settingsReceiver: receiver,
	}

	go plugLocal.listenForPlugCommands(ctx, fs)

	return plugLocal, nil
}

const plugCommandsCollection = "plug_commands"

func (p *PlugLocalState) listenForPlugCommands(ctx context.Context, fs *firestore.Client) {
	// Query documents where 'plug_id' matches the current plug's ID.
	query := fs.Collection(plugCommandsCollection).Where("plug_id", "==", p.plug.ID()).Snapshots(ctx)

	for {
		// Get the next snapshot.
		snapshot, err := query.Next()
		if err == iterator.Done {
			log.Printf("Exiting plug listener loop")
			break // Exit the loop if iterator is done.
		}
		if err != nil {
			log.Printf("Error listening for plug commands: %v", err)
			continue // Skip to the next iteration on error.
		}

		// Process each document change in the snapshot.
		for _, doc := range snapshot.Changes {
			if doc.Kind != firestore.DocumentAdded {
				continue
			}

			var cmd contracts.PlugCommand
			err := doc.Doc.DataTo(&cmd)
			if err != nil {
				log.Printf("Error decoding plug command: %v", err)
				continue
			}
			// Process the plug command here.
			fmt.Println("got plug command")

			err = p.plug.SetState(cmd.GetRequestedState())
			if err != nil {
				log.Printf("Error setting state: %v", err)
				continue
			}

		}
	}
}
