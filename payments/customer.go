package payments

import (
	"context"
	"fmt"
	"log/slog"

	"cloud.google.com/go/firestore"
	"github.com/stripe/stripe-go/v76"
)

func CustomerUpdated(ctx context.Context, fs *firestore.Client, e stripe.Event) error {
	slog.Info("payment method detached")

	customer, ok := e.Data.Object["id"].(string)
	if !ok {
		return fmt.Errorf("'customer' field not in previous_attributes")
	}

	invoiceSettings, ok := e.Data.Object["invoice_settings"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("'invoice_settings' field not in object")
	}

	defaultPayentMethodInterface, ok := invoiceSettings["default_payment_method"]
	if !ok {
		return fmt.Errorf("'default_payment_method' field not in object")
	}

	// if default payment method is null we set it to a blank string
	defaultPayentMethod := ""
	defaultPayentMethod, _ = defaultPayentMethodInterface.(string)

	customers, err := fs.Collection(FsCollStripeCustomers).Where("stripe_id", "==", customer).Limit(1).Documents(ctx).GetAll()
	if err != nil {
		return err
	}

	if len(customers) != 1 {
		return fmt.Errorf("did not get 1 customer to detach payment from")
	}

	_, err = customers[0].Ref.Update(ctx, []firestore.Update{
		{
			Path:  "default_payment_method",
			Value: defaultPayentMethod,
		},
	})

	return nil

}
