package main

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func ensureSiteSettingsDoc(ctx context.Context, fs *firestore.Client, clientID string) error {
	// Reference to the document
	docRef := fs.Collection(common.CollectionSiteSettings).Doc(clientID)

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

func ensurePlugSettingsDoc(ctx context.Context, fs *firestore.Client, plugID string) error {
	// Reference to the document
	docRef := fs.Collection(common.CollectionPlugSettings).Doc(plugID)

	// Try to get the document
	_, err := docRef.Get(ctx)
	if err == nil {
		// Document exists, so do nothing
		return nil
	}

	// Check if the error is because the document doesn't exist
	if status.Code(err) != codes.NotFound {
		// An error other than NotFound occurred
		return fmt.Errorf("Failed to check PlugSettings document: %v", err)
	}

	// The document does not exist, create a new one with a full instance of SiteSettings
	_, err = docRef.Set(ctx, contracts.PlugSettings{
		Id: plugID,
	})
	if err != nil {
		return fmt.Errorf("Failed to create PlugSettings document: %v", err)
	}

	return nil
}

func ensurePlugStatusDoc(ctx context.Context, fs *firestore.Client, siteID string, reading *contracts.Reading) error {
	// Reference to the document
	docRef := fs.Collection(common.CollectionPlugStatus).Doc(reading.PlugId)

	// Try to get the document
	_, err := docRef.Get(ctx)
	if err == nil {
		// Document exists, so do nothing
		return nil
	}

	// Check if the error is because the document doesn't exist
	if status.Code(err) != codes.NotFound {
		// An error other than NotFound occurred
		return fmt.Errorf("Failed to check PlugStatus document: %v", err)
	}

	// The document does not exist, create a new one with a full instance of SiteSettings
	_, err = docRef.Set(ctx, contracts.PlugStatus{
		Id:            reading.PlugId,
		LatestReading: reading,
		SiteId:        siteID,
	})
	if err != nil {
		return fmt.Errorf("Failed to create PlugStatus document: %v", err)
	}

	return nil
}
