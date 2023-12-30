package functions

import (
	"context"
	"log/slog"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/customer"
)

const (
	FsCollStripeCustomers = "stripe_customers"
)

func init() {
	slog.SetDefault(common.Logger)
	stripe.Key = "sk_test_51OKyPREiJxehnemBUXuQv5NDjqkPqwozTyEwxUegS5kiCCUWhgw9C6A6HCGNR9ouAwEdym9CCvZL0Spnw34cVAow00Q67ZTEyH"
}

// AuthEvent is the payload of a Firestore Auth event.
type AuthEvent struct {
	Email    string `json:"email"`
	Metadata struct {
		CreatedAt time.Time `json:"createdAt"`
	} `json:"metadata"`
	UID string `json:"uid"`
}

func OnUserCreated(ctx context.Context, e AuthEvent) error {
	slog.Info("Function triggered by creation of user", "auth_event", e)

	// Create a new customer in Stripe
	params := &stripe.CustomerParams{
		Email: stripe.String(e.Email),
		Metadata: map[string]string{
			"firebase_userid": e.UID,
		},
	}
	c, err := customer.New(params)
	if err != nil {
		slog.Error("failed to make customer", err)
		return err
	}
	slog.Info("created customer in stripe, creating firestore user", "stripe_user", c)

	fs, err := common.InitFirestore(ctx)
	if err != nil {
		slog.Error("failed to init firestore", err)
		return err
	}

	stripeCustomer := &contracts.StripeCustomer{
		StripeId:    c.ID,
		FirestoreId: e.UID,
	}

	_, err = fs.Collection(FsCollStripeCustomers).Doc(e.UID).Set(ctx, stripeCustomer)
	if err != nil {
		slog.Error("failed to save to firestore", err)
		return err
	}

	return nil
}
