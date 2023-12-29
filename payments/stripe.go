package main

import (
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76/webhook"
)

func handleWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)

	payload, err := ioutil.ReadAll(c.Request.Body)
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
