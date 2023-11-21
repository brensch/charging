package main

import (
	"context"
	"log"
	"sync"

	"cloud.google.com/go/firestore"
)

// Receiver is a generic struct that listens to any type of record and makes it available locally.
// T is the generic type parameter representing the type of the latest request.
type Receiver[T any] struct {
	id string

	latest   *T
	latestMu sync.Mutex
}

const (
	// RequestsCollection contains []PlugStateRequestRecord from either the price overwatch or the user
	RequestsCollection = "requests"
)

func InitReceiver[T any](ctx context.Context, fs *firestore.Client, id, collectionName string) (*Receiver[T], error) {

	receiver := &Receiver[T]{
		id: id,
	}

	// Set up a snapshot listener for the sitemeta document
	docRef := fs.Collection(collectionName).Doc(id)
	snapshots := docRef.Snapshots(ctx)
	defer snapshots.Stop()

	go func() {
		for {
			snapshot, err := snapshots.Next()
			if err != nil {
				// TODO: shouldn't be fatal
				log.Fatalf("Error listening to snapshot changes: %v", err)
			}

			// Only proceed if the snapshot has changes
			if !snapshot.Exists() {
				continue
			}

			var data T
			err = snapshot.DataTo(&data)
			if err != nil {
				log.Fatalf("Error converting document snapshot: %v", err)
			}

			receiver.latestMu.Lock()
			receiver.latest = &data
			receiver.latestMu.Unlock()

		}
	}()

	return receiver, nil
}

func (r *Receiver[T]) GetLatest() *T {
	r.latestMu.Lock()
	defer r.latestMu.Unlock()
	return r.latest
}
