package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/payments"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
)

var (
	stripeKeySecretLocation = "projects/368022146565/secrets/stripe_key/versions/latest"
)

func init() {
	slog.SetDefault(common.Logger)
	ctx := context.Background()
	slog.Info("starting payment service")

	// Create the client
	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		slog.Error("Failed to create secret manager client", "error", err)
		panic(err)
	}
	defer client.Close()
	slog.Info("initialised secret server")

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

	slog.Info("got secrets")

	stripe.Key = string(result.GetPayload().GetData())
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

	addr := "0.0.0.0:" + port
	slog.Info("Running router", "addr", addr)
	router.Run(addr)
}
