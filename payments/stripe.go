package payments

import (
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/webhook"
)

func HandleWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Error reading request body: %v\n", err)
		c.Status(http.StatusServiceUnavailable)
		return
	}

	// This is your Stripe CLI webhook secret for testing your endpoint locally.
	endpointSecret := "whsec_990f93f7953a6fa0bd59e0bf51f9df2f0b3055581b9f4cf1fe70675e5be99df9"

	event, err := webhook.ConstructEvent(payload, c.GetHeader("Stripe-Signature"), endpointSecret)
	if err != nil {
		log.Printf("Error verifying webhook signature: %v\n", err)
		c.Status(http.StatusBadRequest) // Return a 400 error on a bad signature
		return
	}

	// Unmarshal the event data into an appropriate struct depending on its Type
	switch event.Type {
	case "payment_intent.succeeded":
		// Then define and call a function to handle the event payment_intent.succeeded
		// ... handle other event types
	default:
		log.Printf("Unhandled event type: %s\n", event.Type)
	}

	c.Status(http.StatusOK)
}

func HandleEnrolCustomer(c *gin.Context) {
	// Extract the customerID from the URL
	customerID := c.Param("customerID")

	// The Setup mode is not a transaction, it's just to setup payment intent
	params := &stripe.CheckoutSessionParams{
		Customer:   stripe.String(customerID),
		Currency:   stripe.String("aud"),
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSetup)),
		SuccessURL: stripe.String("https://sparkplugs.io/success"),
		CancelURL:  stripe.String("https://example.com/cancel"),
	}

	s, err := session.New(params)
	if err != nil {
		log.Printf("session.New: %v", err)
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.Redirect(http.StatusSeeOther, s.URL)
}
