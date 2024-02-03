package main

// // Receiver is a generic struct that listens to any type of record and makes it available locally.
// // T is the generic type parameter representing the type of the latest request.
// type Receiver[T any] struct {
// 	id string

// 	latest   *T
// 	latestMu sync.Mutex
// }

// const (
// 	// RequestsCollection contains []PlugStateRequestRecord from either the price overwatch or the user
// 	RequestsCollection = "requests"
// )

// func InitReceiver[T any](ctx context.Context, fs *firestore.Client, ider electrical.IDer, collectionName string) (*Receiver[T], error) {

// 	receiver := &Receiver[T]{
// 		id: ider.ID(),
// 	}

// 	// Set up a snapshot listener for the sitemeta document
// 	docRef := fs.Collection(collectionName).Doc(ider.ID())
// 	snapshots := docRef.Snapshots(ctx)

// 	go func() {
// 		defer snapshots.Stop()

// 		for {
// 			snapshot, err := snapshots.Next()
// 			if err != nil {
// 				// TODO: shouldn't be fatal
// 				log.Fatalf("Error listening to snapshot changes: %v", err)
// 			}

// 			// Only proceed if the snapshot has changes
// 			if !snapshot.Exists() {
// 				continue
// 			}

// 			var data T
// 			err = snapshot.DataTo(&data)
// 			if err != nil {
// 				log.Fatalf("Error converting document snapshot: %v", err)
// 			}

// 			receiver.latestMu.Lock()
// 			receiver.latest = &data
// 			receiver.latestMu.Unlock()
// 		}

// 	}()

// 	// get first state

// 	snapshot, err := docRef.Get(ctx)
// 	if status.Code(err) != codes.NotFound {
// 		var data T
// 		err = snapshot.DataTo(&data)
// 		if err != nil {
// 			return receiver, err
// 		}
// 		receiver.latestMu.Lock()
// 		defer receiver.latestMu.Unlock()
// 		receiver.latest = &data
// 		return receiver, nil
// 	}

// 	// create document if it doesn't exist
// 	_, err = docRef.Set(ctx, map[string]string{
// 		"id":      ider.ID(),
// 		"site_id": ider.SiteID(),
// 	})

// 	return receiver, err
// }

// func (r *Receiver[T]) GetLatest() *T {
// 	r.latestMu.Lock()
// 	defer r.latestMu.Unlock()
// 	return r.latest
// }
