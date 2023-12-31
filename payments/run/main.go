package main

import (
	"context"
	"log"
	"log/slog"
	"os"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/payments"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
)

var (
	customerID              = "cus_PEXXEakMP5rBQ0"
	stripeKeySecretLocation = "projects/368022146565/secrets/stripe_key/versions/latest"
)

func init() {
	slog.SetDefault(common.Logger)
	ctx := context.Background()

	// set stripe key
	// Create the client
	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		slog.Error("Failed to create secret manager client", "error", err)
		panic(err)
	}
	defer client.Close()

	// Build the request
	req := &secretmanagerpb.AccessSecretVersionRequest{
		Name: stripeKeySecretLocation,
	}

	// Call the API
	result, err := client.AccessSecretVersion(ctx, req)
	if err != nil {
		slog.Error("Failed to access secret version", "error", err)
		panic(err)
	}

	stripe.Key = result.String()
}

func main() {

	router := gin.Default()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	fs, err := common.InitFirestore(ctx)
	if err != nil {
		slog.Error("failed to init firestore", "error", err)
		panic(err)
	}

	handler, err := payments.InitHandler(fs)
	if err != nil {
		slog.Error("failed to init handler", "error", err)
		panic(err)
	}

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
