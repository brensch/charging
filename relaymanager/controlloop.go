package main

import (
	"context"
	"fmt"
	"log"

	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"

	"cloud.google.com/go/firestore"
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
	return &PlugLocalState{
		plug:             plug,
		settingsReceiver: receiver,
	}, nil
}

const FuzeSettingsCollection = "fuze_settings"

type FuzeLocalState struct {
	fuze             electrical.Fuze
	settingsReceiver *Receiver[contracts.FuzeSettings]
}

func InitFuzeLocalState(ctx context.Context, fs *firestore.Client, fuze electrical.Fuze) (*FuzeLocalState, error) {
	receiver, err := InitReceiver[contracts.FuzeSettings](ctx, fs, fuze, FuzeSettingsCollection)
	if err != nil {
		return nil, err
	}
	return &FuzeLocalState{
		fuze:             fuze,
		settingsReceiver: receiver,
	}, nil
}

func ControlLoop(localPlugs []*PlugLocalState, localFuzes []*FuzeLocalState, readingsCHAN chan *contracts.Reading) {
	fmt.Println("running control loop")

	for _, localPlug := range localPlugs {
		fmt.Println(localPlug.settingsReceiver.GetLatest().GetId())

		reading, err := localPlug.plug.GetReading()
		if err != nil {
			log.Println("failed to get reading", err)
			continue
		}

		readingsCHAN <- reading

	}

}
