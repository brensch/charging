package main

import (
	"context"
	"fmt"
	"sync"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/gen/go/contracts"
)

type PlugLocalState struct {
	PlugID          string
	requestReceiver *Receiver[contracts.PlugStateRequestRecord]
}

type SiteLocalState struct {
	AllPlugs   []*PlugLocalState
	AllPlugsMu sync.Mutex

	settingsReceiver *Receiver[contracts.SiteSettings]
}

func InitPlugLocalState(ctx context.Context, fs *firestore.Client, plugID string) (*PlugLocalState, error) {
	receiver, err := InitReceiver[contracts.PlugStateRequestRecord](ctx, fs, plugID, RequestsCollection)
	if err != nil {
		return nil, err
	}
	return &PlugLocalState{
		PlugID:          plugID,
		requestReceiver: receiver,
	}, nil
}

func InitSiteLocalState(ctx context.Context, fs *firestore.Client, plugIDs []string) (*SiteLocalState, error) {

	siteLocalState := &SiteLocalState{}

	for _, plugID := range plugIDs {
		plug, err := InitPlugLocalState(ctx, fs, plugID)
		if err != nil {
			return nil, err
		}
		siteLocalState.AllPlugs = append(siteLocalState.AllPlugs, plug)
	}

	return siteLocalState, nil
}

func ControlLoop(siteLocalState *SiteLocalState) {
	fmt.Println("running control loop")

}
