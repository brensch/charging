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

func GetBalance(ctx context.Context, fs *firestore.Client, clientID string) (*contracts.CustomerBalance, error) {
	doc, err := fs.Collection(common.CollectionCustomerBalances).Doc(clientID).Get(ctx)
	if err != nil {
		return nil, err
	}

	customerBalance := &contracts.CustomerBalance{}
	err = doc.DataTo(&customerBalance)
	return customerBalance, err
}
