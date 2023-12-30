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

	customers, err := fs.Collection(FsCollStripeCustomers).Where("stripe_id", "==", customer).Documents(ctx).GetAll()
	if err != nil {
		return err
	}

	for _, customerDoc := range customers {
		_, err = customerDoc.Ref.Update(ctx, []firestore.Update{
			{
				Path:  "payment_methods",
				Value: firestore.ArrayUnion(paymentMethodID),
			},
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func PaymentMethodDetached(ctx context.Context, e stripe.Event) error {
	slog.Info("payment method detached")
	// TODO
	return nil

}
