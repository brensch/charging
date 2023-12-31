package main

import (
	"context"
	"log"
	"log/slog"
	"os"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/payments"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
)

var (
	customerID = "cus_PEXXEakMP5rBQ0"
)

func init() {
	slog.SetDefault(common.Logger)
}

func main() {

	// This is your test secret API key.
	stripe.Key = "sk_test_51OKyPREiJxehnemBUXuQv5NDjqkPqwozTyEwxUegS5kiCCUWhgw9C6A6HCGNR9ouAwEdym9CCvZL0Spnw34cVAow00Q67ZTEyH"

	router := gin.Default()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	fs, err := common.InitFirestore(ctx)
	if err != nil {
		slog.Error("failed to init firestore", "error", err)
	}

	handler := payments.InitHandler(fs)

	// Register the Gin handlers
	router.GET("/topup/:customerID", handler.HandleManualTopup)
	router.GET("/manage/:customerID", handler.HandleManageCustomer)
	router.POST("/charge", handler.HandleChargeCustomer)
	router.POST("/hook", handler.HandleWebhook) // Assuming handleWebhook is a POST endpoint

	// Use Gin's run method to start the server on the specified port
	port := os.Getenv("PORT")
	if port == "" {
		port = "4242" // default port if not specified
	}
	log.Printf("Listening on http://0.0.0.0:%s", port)
	router.Run("0.0.0.0:" + port)
}
