package payments

import (
	"io"
	"log/slog"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

const (
	FsCollStripeCustomers = "stripe_customers"
)

type Handler struct {
	fs *firestore.Client
}

func InitHandler(fs *firestore.Client) *Handler {
	return &Handler{
		fs: fs,
	}
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

	event, err := DecodeEvent(payload, endpointSecret, signature)
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

func (h *Handler) HandleEnrolCustomer(c *gin.Context) {

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
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSetup)),
		SuccessURL: stripe.String("https://sparkplugs.io/success"),
		CancelURL:  stripe.String("https://example.com/cancel"),
	}

	s, err := session.New(params)
	if err != nil {
		slog.Error("error creating new stripe session", "error", err)
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Redirect(http.StatusSeeOther, s.URL)
}
