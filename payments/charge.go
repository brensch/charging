package payments

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
)

func (h *Handler) HandleChargeCustomer(c *gin.Context) {

	var req *contracts.PaymentRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		slog.Error("Error reading request body", "error", err)
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = ChargeCustomer(c.Request.Context(), h.fs, req)
	if err != nil {
		slog.Error("Error charging customer", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func ChargeCustomer(ctx context.Context, fs *firestore.Client, req *contracts.PaymentRequest) error {

	doc, err := fs.Collection(FsCollStripeCustomers).Doc(req.FirestoreId).Get(ctx)
	if err != nil {
		return err
	}

	var stripeCustomer *contracts.StripeCustomer
	err = doc.DataTo(&stripeCustomer)
	if err != nil {
		return err
	}

	if len(stripeCustomer.PaymentMethods) == 0 {
		return fmt.Errorf("no payment methods associated with account")
	}

	// use default payment method. if there's no default, use the first in the index
	paymentMethod := stripeCustomer.DefaultPaymentMethod
	if paymentMethod == "" {
		paymentMethod = stripeCustomer.PaymentMethods[0]
	}

	intentParams := &stripe.PaymentIntentParams{
		Amount:        stripe.Int64(req.AmountAud), // Amount in cents
		Currency:      stripe.String(string(stripe.CurrencyAUD)),
		Customer:      stripe.String(stripeCustomer.StripeId),
		PaymentMethod: &paymentMethod,
		OffSession:    stripe.Bool(true),
		Confirm:       stripe.Bool(true),
	}

	pi, err := paymentintent.New(intentParams)
	if err != nil {
		return err
	}

	slog.Info("payment intent created", "intent", pi)
	return nil
}

func ReceiveCustomerCharge(ctx context.Context, fs *firestore.Client, e stripe.Event) error {

	amountReceived, ok := e.Data.Object["amount"].(float64)
	if !ok {
		return fmt.Errorf("'amount_received' field not in object")
	}

	customerID, ok := e.Data.Object["customer"].(string)
	if !ok {
		return fmt.Errorf("'customer' field not in object")
	}
	paymentMethod, ok := e.Data.Object["payment_method"].(string)
	if !ok {
		return fmt.Errorf("'payment_method' field not in object")
	}
	paymentID, ok := e.Data.Object["id"].(string)
	if !ok {
		return fmt.Errorf("'id' field not in object")
	}

	customers, err := fs.Collection(FsCollStripeCustomers).Where("stripe_id", "==", customerID).Limit(1).Documents(ctx).GetAll()
	if err != nil {
		return err
	}

	if len(customers) != 1 {
		return fmt.Errorf("no customer for id: %s", customerID)
	}

	var stripeCustomer *contracts.StripeCustomer
	err = customers[0].DataTo(&stripeCustomer)
	if err != nil {
		return err
	}

	transaction := &contracts.Transaction{
		FirestoreId:   stripeCustomer.FirestoreId,
		PaymentMethod: paymentMethod,
		CentsAud:      int64(amountReceived),
		PaymentId:     paymentID,
	}
	return RecordTransaction(ctx, fs, transaction)
}

const (
	FsCollTransactions     = "transactions"
	FsCollCustomerBalances = "customer_balances"
)

func RecordTransaction(ctx context.Context, fs *firestore.Client, t *contracts.Transaction) error {
	// Start a Firestore transaction
	err := fs.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Step 1: Add the transaction record
		t.CompletedMs = time.Now().UnixMilli()
		transactionRef := fs.Collection(FsCollTransactions).NewDoc()
		err := tx.Set(transactionRef, t)
		if err != nil {
			return fmt.Errorf("failed to record transaction: %w", err)
		}

		// Step 2: Update the customer balance
		customerBalanceRef := fs.Collection(FsCollCustomerBalances).Doc(t.FirestoreId)
		err = tx.Update(customerBalanceRef, []firestore.Update{
			{
				Path:  "cents_aud",
				Value: firestore.Increment(t.CentsAud),
			},
			{
				Path:  "last_update_ms",
				Value: time.Now().UnixMilli(),
			},
		})
		if err != nil {
			return fmt.Errorf("failed to update customer balance: %w", err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("transaction failed: %w", err)
	}

	return nil
}
