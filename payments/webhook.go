package payments

import (
	"context"
	"log"
	"log/slog"

	"cloud.google.com/go/firestore"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

var (

	// TODO: derive from secret manager
	endpointSecret = "whsec_990f93f7953a6fa0bd59e0bf51f9df2f0b3055581b9f4cf1fe70675e5be99df9"
)

func RouteEvent(ctx context.Context, fs *firestore.Client, event stripe.Event) error {

	slog.Info("got stripe event", "event", event)

	// Unmarshal the event data into an appropriate struct depending on its Type
	switch event.Type {
	case "payment_method.attached":
		return PaymentMethodAttached(ctx, fs, event)
	case "payment_method.detached":
		return PaymentMethodDetached(ctx, event)
	case "payment_intent.succeeded":
		return ReceiveCustomerCharge(ctx, fs, event)
	default:
		log.Printf("Unhandled event type: %s\n", event.Type)
	}

	return nil
}

func DecodeEvent(rawEvent []byte, secret, signature string) (stripe.Event, error) {
	return webhook.ConstructEvent(rawEvent, signature, secret)
}
