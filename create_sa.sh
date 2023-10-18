#!/bin/bash

# Variables
PROJECT_ID="charging-402405"
SERVICE_ACCOUNT_NAME="remote-device-sa"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
KEY_PATH="./$SERVICE_ACCOUNT_NAME-key.json"

# Create a new service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --description="Service account for remote devices" \
    --display-name="Remote Device Service Account"

# Grant Cloud Run invoker role to the service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/run.invoker"

# Generate and download a key for the service account
gcloud iam service-accounts keys create $KEY_PATH \
    --iam-account=$SERVICE_ACCOUNT_EMAIL
