package payments

import (
	"context"
	"fmt"
	"log/slog"

	"cloud.google.com/go/firestore"
	"github.com/stripe/stripe-go/v76"
)

func PaymentMethodAttached(ctx context.Context, fs *firestore.Client, e stripe.Event) error {
	slog.Info("payment method attached")

	// var object stripe.attach
	customer, ok := e.Data.Object["customer"]
	if !ok {
		return fmt.Errorf("'customer' field not in object")
	}
	paymentMethodID, ok := e.Data.Object["id"]
	if !ok {
		return fmt.Errorf("'id' field not in object")
	}

	customers, err := fs.Collection(FsCollStripeCustomers).Where("stripe_id", "==", customer).Limit(1).Documents(ctx).GetAll()
	if err != nil {
		return err
	}

	if len(customers) != 1 {
		return fmt.Errorf("did not get 1 customer to attach payment to")
	}

	_, err = customers[0].Ref.Update(ctx, []firestore.Update{
		{
			Path:  "payment_methods",
			Value: firestore.ArrayUnion(paymentMethodID),
		},
	})

	return err
}

func PaymentMethodDetached(ctx context.Context, fs *firestore.Client, e stripe.Event) error {
	slog.Info("payment method detached")

	customer, ok := e.Data.PreviousAttributes["customer"].(string)
	if !ok {
		return fmt.Errorf("'customer' field not in previous_attributes")
	}

	paymentMethodID, ok := e.Data.Object["id"]
	if !ok {
		return fmt.Errorf("'id' field not in object")
	}

	customers, err := fs.Collection(FsCollStripeCustomers).Where("stripe_id", "==", customer).Limit(1).Documents(ctx).GetAll()
	if err != nil {
		return err
	}

	if len(customers) != 1 {
		return fmt.Errorf("did not get 1 customer to detach payment from")
	}

	_, err = customers[0].Ref.Update(ctx, []firestore.Update{
		{
			Path:  "payment_methods",
			Value: firestore.ArrayRemove(paymentMethodID),
		},
	})

	return nil

}
