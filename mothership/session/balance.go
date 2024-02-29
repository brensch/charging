package session

import (
	"context"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
)

func UpdateBalance(ctx context.Context, fs *firestore.Client, session *contracts.Session) error {
	_, err := fs.Collection(common.CollectionCustomerBalances).Doc(session.OwnerId).Update(ctx, []firestore.Update{
		{Path: "cents_aud", Value: firestore.Increment(-session.Cents)},
	})
	return err
}
