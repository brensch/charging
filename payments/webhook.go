package payments

import (
	"context"
	"log/slog"

	"cloud.google.com/go/firestore"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

func RouteEvent(ctx context.Context, fs *firestore.Client, event stripe.Event) error {

	slog.Info("got stripe event", "event", event)

	// Unmarshal the event data into an appropriate struct depending on its Type
	switch event.Type {
	case "payment_method.attached":
		return PaymentMethodAttached(ctx, fs, event)
	case "payment_method.detached":
		return PaymentMethodDetached(ctx, fs, event)
	case "payment_intent.succeeded":
		return ReceiveCustomerCharge(ctx, fs, event)
	case "customer.updated":
		return CustomerUpdated(ctx, fs, event)
	default:
		slog.Debug("Unhandled event type", "type", event.Type)
	}

	return nil
}

func DecodeEvent(rawEvent []byte, secret, signature string) (stripe.Event, error) {
	return webhook.ConstructEvent(rawEvent, signature, secret)
}
