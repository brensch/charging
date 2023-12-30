package main

import (
	"log"
	"os"

	"github.com/brensch/charging/payments"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
)

var (
	customerID = "cus_PEXXEakMP5rBQ0"
)

func main() {
	// This is your test secret API key.
	stripe.Key = "sk_test_51OKyPREiJxehnemBUXuQv5NDjqkPqwozTyEwxUegS5kiCCUWhgw9C6A6HCGNR9ouAwEdym9CCvZL0Spnw34cVAow00Q67ZTEyH"

	router := gin.Default()

	// Register the Gin handlers
	router.GET("/enrol/:customerID", payments.HandleEnrolCustomer)
	// router.POST("/charge", handleChargeCustomer) // Assuming handleChargeCustomer is a POST endpoint
	router.POST("/hook", payments.HandleWebhook) // Assuming handleWebhook is a POST endpoint

	// Use Gin's run method to start the server on the specified port
	port := os.Getenv("PORT")
	if port == "" {
		port = "4242" // default port if not specified
	}
	log.Printf("Listening on http://0.0.0.0:%s", port)
	router.Run("0.0.0.0:" + port)
}
