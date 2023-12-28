package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/api/iterator"
)

const PlugSettingsCollection = "plug_settings"

type LocalPlugState struct {
	plug             electrical.Plug
	settingsReceiver *Receiver[contracts.PlugSettings]
	siteID           string
}

func InitLocalPlugState(ctx context.Context, fs *firestore.Client, plug electrical.Plug) (*LocalPlugState, error) {
	receiver, err := InitReceiver[contracts.PlugSettings](ctx, fs, plug, PlugSettingsCollection)
	if err != nil {
		return nil, err
	}

	plugLocal := &LocalPlugState{
		plug:             plug,
		settingsReceiver: receiver,
	}

	go plugLocal.listenForPlugCommands(ctx, fs)

	return plugLocal, nil
}

const plugCommandsCollection = "plug_commands"

func (p *LocalPlugState) listenForPlugCommands(ctx context.Context, fs *firestore.Client) {
	// Query documents where 'plug_id' matches the current plug's ID.
	query := fs.Collection(plugCommandsCollection).
		Where("plug_id", "==", p.plug.ID()).
		Where("acked_at_ms", "==", 0).
		Snapshots(ctx)

	for {
		// Get the next snapshot.
		snapshot, err := query.Next()
		if err == iterator.Done {
			log.Printf("Exiting plug listener loop")
			break // Exit the loop if iterator is done.
		}
		if err != nil {
			log.Printf("Error listening for plug commands: %v", err)
			// TODO: proper backoff
			time.Sleep(100 * time.Millisecond)
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
			fmt.Println("got plug command: ", cmd.PlugId, cmd.RequestedState)

			err = p.plug.SetState(cmd.GetRequestedState())
			if err != nil {
				log.Printf("Error setting state: %v", err)
				continue
			}

			// ack the message
			doc.Doc.Ref.Set(ctx, map[string]interface{}{
				"acked_at_ms":  time.Now().UnixMilli(),
				"acked_by_key": p.plug.SiteID(),
			})

		}
	}
}
