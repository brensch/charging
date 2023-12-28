package main

import (
	"context"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
)

const FuzeSettingsCollection = "fuze_settings"

type LocalFuzeState struct {
	fuze             electrical.Fuze
	settingsReceiver *Receiver[contracts.FuzeSettings]
}

func InitLocalFuzeState(ctx context.Context, fs *firestore.Client, fuze electrical.Fuze) (*LocalFuzeState, error) {
	receiver, err := InitReceiver[contracts.FuzeSettings](ctx, fs, fuze, FuzeSettingsCollection)
	if err != nil {
		return nil, err
	}
	return &LocalFuzeState{
		fuze:             fuze,
		settingsReceiver: receiver,
	}, nil
}
