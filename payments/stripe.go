package payments

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"

	"cloud.google.com/go/firestore"
	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/billingportal/configuration"
	billingsession "github.com/stripe/stripe-go/v76/billingportal/session"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

const (
	FsCollStripeCustomers      = "stripe_customers"
	FsCollAutoTopupPreferences = "autotopup_preferences"

	FrontendURL = "https://charging-402405.web.app/"
)

var (
	CreditPriceID = "price_1OQ3nBEiJxehnemB3la7Cjpo"
)

type Handler struct {
	fs         *firestore.Client
	hookSecret string
}

func InitHandler(fs *firestore.Client) (*Handler, error) {
	handler := &Handler{
		fs: fs,
	}
	err := handler.retrieveSecret("projects/368022146565/secrets/webhook_secret/versions/latest")
	return handler, err
}

// retrieveSecret retrieves a secret from the Google Cloud Secret Manager
func (h *Handler) retrieveSecret(secretID string) error {
	ctx := context.Background()

	// Create the client
	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		slog.Error("Failed to create secret manager client", "error", err)
		return err
	}
	defer client.Close()

	// Build the request
	req := &secretmanagerpb.AccessSecretVersionRequest{
		Name: secretID,
	}

	// Call the API
	result, err := client.AccessSecretVersion(ctx, req)
	if err != nil {
		slog.Error("Failed to access secret version", "error", err)
		return err
	}

	// Store the secret in the handler
	h.hookSecret = string(result.GetPayload().GetData())
	return nil
}

func (h *Handler) HandleWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		slog.Error("Error reading request body", "error", err)
		c.Status(http.StatusServiceUnavailable)
		return
	}

	signature := c.GetHeader("Stripe-Signature")

	event, err := DecodeEvent(payload, h.hookSecret, signature)
	if err != nil {
		slog.Error("Error decoding event", "error", err)
		c.Status(http.StatusBadRequest) // Return a 400 error on a bad signature
		return
	}

	err = RouteEvent(c.Request.Context(), h.fs, event)
	if err != nil {
		slog.Error("Error handling event", "error", err)
		c.Status(http.StatusBadRequest) // Return a 400 error on a bad signature
		return
	}

	c.Status(http.StatusOK)
}

func (h *Handler) HandleManualTopup(c *gin.Context) {

	// Extract the customerID from the URL
	customerID := c.Param("customerID")

	// get the stripecustomer doc for that customer
	fs, err := common.InitFirestore(c.Request.Context())
	if err != nil {
		slog.Error("error creating firestore client", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	doc, err := fs.Collection(FsCollStripeCustomers).Doc(customerID).Get(c.Request.Context())
	if err != nil {
		slog.Error("error retrieving customer info", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	var stripeCustomer *contracts.StripeCustomer
	err = doc.DataTo(&stripeCustomer)
	if err != nil {
		slog.Error("error decoding stripe customer", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// The Setup mode is not a transaction, it's just to setup payment intent
	params := &stripe.CheckoutSessionParams{
		Customer:   stripe.String(stripeCustomer.StripeId),
		Currency:   stripe.String("aud"),
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(fmt.Sprintf("%s/money", FrontendURL)),
		CancelURL:  stripe.String(fmt.Sprintf("%s/money", FrontendURL)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price: &CreditPriceID,
				AdjustableQuantity: &stripe.CheckoutSessionLineItemAdjustableQuantityParams{
					Minimum: stripe.Int64(10),
					Enabled: stripe.Bool(true),
				},
				Quantity: stripe.Int64(10),
			},
		},
	}

	// // if there's a payment method available, add it
	// // need to check for either a default, or just the first in the array if it exists
	// paymentMethod := stripeCustomer.DefaultPaymentMethod
	// if paymentMethod == "" && len(stripeCustomer.PaymentMethods) > 0 {
	// 	paymentMethod = stripeCustomer.PaymentMethods[0]
	// }
	// if paymentMethod != "" {
	// 	params.PaymentMethodConfiguration = stripe.String(paymentMethod)
	// }

	s, err := session.New(params)
	if err != nil {
		slog.Error("error creating new stripe session", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Redirect(http.StatusSeeOther, s.URL)
}

func (h *Handler) HandleManageCustomer(c *gin.Context) {

	// Extract the customerID from the URL
	customerID := c.Param("customerID")

	// get the stripecustomer doc for that customer
	fs, err := common.InitFirestore(c.Request.Context())
	if err != nil {
		slog.Error("error creating firestore client", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	doc, err := fs.Collection(FsCollStripeCustomers).Doc(customerID).Get(c.Request.Context())
	if err != nil {
		slog.Error("error retrieving customer info", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	var stripeCustomer *contracts.StripeCustomer
	err = doc.DataTo(&stripeCustomer)
	if err != nil {
		slog.Error("error decoding stripe customer", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	configParams := &stripe.BillingPortalConfigurationParams{
		BusinessProfile: &stripe.BillingPortalConfigurationBusinessProfileParams{
			Headline: stripe.String("Magic Charge partners with Stripe for simplified billing."),
		},
		Features: &stripe.BillingPortalConfigurationFeaturesParams{
			PaymentMethodUpdate: &stripe.BillingPortalConfigurationFeaturesPaymentMethodUpdateParams{
				Enabled: stripe.Bool(true),
			},
		},
		DefaultReturnURL: stripe.String(fmt.Sprintf("%s/money", FrontendURL)),
	}

	s, err := configuration.New(configParams)
	if err != nil {
		slog.Error("error creating new stripe billing param config", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	sessionParams := &stripe.BillingPortalSessionParams{
		Customer:      stripe.String(stripeCustomer.StripeId),
		Configuration: &s.ID,
	}
	session, err := billingsession.New(sessionParams)
	if err != nil {
		slog.Error("error creating new stripe session", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Redirect(http.StatusSeeOther, session.URL)
}
