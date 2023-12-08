package main

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func ensureSiteSettingsDoc(ctx context.Context, fs *firestore.Client, clientID string) error {
	// Reference to the document
	docRef := fs.Collection(CollectionSiteSettings).Doc(clientID)

	// Try to get the document
	_, err := docRef.Get(ctx)
	if err == nil {
		// Document exists, so do nothing
		return nil
	}

	// Check if the error is because the document doesn't exist
	if status.Code(err) != codes.NotFound {
		// An error other than NotFound occurred
		return fmt.Errorf("Failed to check SiteSettings document: %v", err)
	}

	// The document does not exist, create a new one with a full instance of SiteSettings
	_, err = docRef.Set(ctx, contracts.SiteSettings{
		Id: clientID,
	})
	if err != nil {
		return fmt.Errorf("Failed to create SiteSettings document: %v", err)
	}

	return nil
}
