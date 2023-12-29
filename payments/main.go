package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

var (
	customerID = "cus_PEXXEakMP5rBQ0"
)

func main() {
	// This is your test secret API key.
	stripe.Key = "sk_test_51OKyPREiJxehnemBUXuQv5NDjqkPqwozTyEwxUegS5kiCCUWhgw9C6A6HCGNR9ouAwEdym9CCvZL0Spnw34cVAow00Q67ZTEyH"

	router := gin.Default()

	// Register the Gin handlers
	router.GET("/enrol/:customerID", handleEnrolCustomer)
	// router.POST("/charge", handleChargeCustomer) // Assuming handleChargeCustomer is a POST endpoint
	router.POST("/hook", handleWebhook) // Assuming handleWebhook is a POST endpoint

	// Use Gin's run method to start the server on the specified port
	port := os.Getenv("PORT")
	if port == "" {
		port = "4242" // default port if not specified
	}
	log.Printf("Listening on http://0.0.0.0:%s", port)
	router.Run("0.0.0.0:" + port)
}

func handleEnrolCustomer(c *gin.Context) {
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

// func handleChargeCustomer(w http.ResponseWriter, r *http.Request) {

// 	params := &stripe.PaymentMethodListParams{
// 		Customer: stripe.String(customerID), // Replace with the actual customer ID
// 	}
// 	i := paymentmethod.List(params)

// 	var method string
// 	for i.Next() {
// 		fmt.Printf("customer: %+v\n", i.PaymentMethod().Customer)
// 		fmt.Printf("id: %+v\n", i.PaymentMethod().ID)
// 		method = i.PaymentMethod().ID
// 	}

// 	intentParams := &stripe.PaymentIntentParams{
// 		Amount:        stripe.Int64(2000), // Amount in cents
// 		Currency:      stripe.String(string(stripe.CurrencyUSD)),
// 		Customer:      stripe.String(customerID), // Replace with your customer's ID
// 		PaymentMethod: stripe.String(method),     // Replace with your saved payment method ID
// 		OffSession:    stripe.Bool(true),         // Indicate that the payment is happening off-session
// 		Confirm:       stripe.Bool(true),         // Automatically confirm the payment
// 	}

// 	pi, err := paymentintent.New(intentParams)
// 	if err != nil {
// 		log.Fatalf("paymentintent.New: %v", err)
// 	}

// 	log.Printf("PaymentIntent created: %v", pi)

// }
