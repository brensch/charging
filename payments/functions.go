package main

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/functions/metadata"
)

// UserCreatedData is the payload of a GCP event.
type UserCreatedData struct {
	// Add your fields here.
	UserID string `json:"userId"`
}

// OnUserCreated triggers when a new user is created.
func OnUserCreated(ctx context.Context, e UserCreatedData) error {
	meta, err := metadata.FromContext(ctx)
	if err != nil {
		log.Printf("metadata.FromContext: %v", err)
		return err
	}
	log.Printf("Function triggered by change to: %v", meta.Resource)

	// Implement your logic here.
	fmt.Printf("User created: %s\n", e.UserID)

	return nil
}
