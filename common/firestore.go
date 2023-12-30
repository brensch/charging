package common

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
)

const (
	ProjectID = "charging-402405"
)

type Secret struct {
	Type         string `json:"type"`
	ProjectID    string `json:"project_id"`
	PrivateKeyID string `json:"private_key_id"`
	PrivateKey   string `json:"private_key"`
	ClientEmail  string `json:"client_email"`
	// TODO: confirm that clientID is unique to every key
	ClientID string `json:"client_id"`
}

func ExtractProjectAndClientID(filePath string) (string, string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", "", err
	}

	var secret Secret
	err = json.Unmarshal(data, &secret)
	if err != nil {
		return "", "", err
	}

	return secret.ProjectID, secret.ClientID, nil
}

func InitFirestore(ctx context.Context) (*firestore.Client, error) {
	var app *firebase.App
	var err error

	// Check if running in Google Cloud environment
	if os.Getenv("GCP_PROJECT") != "" || os.Getenv("FUNCTION_TARGET") != "" {
		// Initialize Firebase Admin SDK with default credentials
		app, err = firebase.NewApp(ctx, &firebase.Config{
			ProjectID: ProjectID,
		})
		if err != nil {
			slog.Error("Failed to initialize Firebase App with default credentials", "error", err)
			return nil, err
		}
	} else {
		// Initialize Firebase Admin SDK with credentials from the Google Cloud CLI
		app, err = firebase.NewApp(ctx, &firebase.Config{
			ProjectID: ProjectID,
		})
		if err != nil {
			slog.Error("Failed to initialize Firebase App with Google Cloud CLI credentials", "error", err)
			return nil, err
		}
	}

	// Initialize Firestore client
	fs, err := app.Firestore(ctx)
	if err != nil {
		slog.Error("Failed to initialize Firestore client", "error", err)
		return nil, err
	}

	return fs, nil
}
