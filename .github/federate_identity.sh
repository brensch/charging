#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <gcloud-project-id> username/repo"
    exit 1
fi

PROJECT_ID=$1
GITHUB_REPO=$2

# Check if already authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep .; then
    # Authenticate to gcloud
    echo "Authenticating to gcloud..."
    gcloud auth login

    # Check if the authentication was successful
    if [ $? -ne 0 ]; then
        echo "Authentication failed. Exiting."
        exit 1
    fi
else
    echo "Already authenticated to gcloud."
fi

# Set the project in gcloud config
gcloud config set project $PROJECT_ID

echo "Setting up identity federation for project: $PROJECT_ID"

echo "Setting up pool..."
gcloud iam workload-identity-pools create "github-pool" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="github-pool"

echo "Setting up workload..."
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="github-provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.aud=assertion.aud,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get the project number for the given project ID
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

echo "Creating GitHub Action Service Account..."
gcloud iam service-accounts create github-action \
  --display-name "GitHub Action Service Account" \
  --project="$PROJECT_ID"

echo "Granting 'Editor' role to the Service Account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-action@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/editor"

echo "Allowing the identity provider to impersonate the service account..."
gcloud iam service-accounts add-iam-policy-binding "github-action@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_REPO}"

# Creating a configuration file
echo "Generating deploy.conf file..."
cat <<EOL > deploy.conf
PROJECT_ID=$PROJECT_ID
SERVICE_ACCOUNT=github-action@${PROJECT_ID}.iam.gserviceaccount.com
WORKLOAD_IDENTITY_PROVIDER=projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/providers/github-provider
EOL

echo "Done."
