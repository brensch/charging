package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/cloudresourcemanager/v1"
	iam "google.golang.org/api/iam/v1"
)

const (
	projectID  = "charging-402405"
	maxRetries = 10
	retryDelay = 2 * time.Second
)

func waitForServiceAccountCreation(iamService *iam.Service, name string) error {
	for i := 0; i < maxRetries; i++ {
		_, err := iamService.Projects.ServiceAccounts.Get(name).Do()
		if err == nil {
			return nil
		}
		time.Sleep(retryDelay)
		fmt.Println("waiting")
	}
	return fmt.Errorf("Service account not available after waiting")
}

func CreateFirestoreServiceAccount(projectID, accountID, accountDisplayName string) (*iam.ServiceAccountKey, error) {
	ctx := context.Background()

	// Create a client
	client, err := google.DefaultClient(ctx, iam.CloudPlatformScope)
	if err != nil {
		return nil, fmt.Errorf("Failed to create Google default client: %v", err)
	}

	iamService, err := iam.New(client)
	if err != nil {
		return nil, fmt.Errorf("Failed to create IAM service client: %v", err)
	}

	name := fmt.Sprintf("projects/%s/serviceAccounts/%s@%s.iam.gserviceaccount.com", projectID, accountID, projectID)

	// Check if service account already exists
	accountList, err := iamService.Projects.ServiceAccounts.List("projects/" + projectID).Do()
	var account *iam.ServiceAccount
	if err != nil {
		return nil, fmt.Errorf("Failed to list service accounts: %v", err)
	}
	for _, sa := range accountList.Accounts {
		if sa.Email == fmt.Sprintf("%s@%s.iam.gserviceaccount.com", accountID, projectID) {
			account = sa
			break
		}
	}

	// Create a service account if it doesn't exist
	if account == nil {
		account, err = iamService.Projects.ServiceAccounts.Create(
			"projects/"+projectID,
			&iam.CreateServiceAccountRequest{
				AccountId: accountID,
				ServiceAccount: &iam.ServiceAccount{
					DisplayName: accountDisplayName,
				},
			}).Do()
		if err != nil {
			return nil, fmt.Errorf("Failed to create new service account: %v", err)
		}
	}

	err = waitForServiceAccountCreation(iamService, name)
	if err != nil {
		return nil, fmt.Errorf("Failed to wait for service account: %v", err)
	}

	// Assign Firestore read/write role to the service account
	role := "roles/datastore.user"

	crmService, err := cloudresourcemanager.New(client)
	if err != nil {
		return nil, fmt.Errorf("Failed to create Cloud Resource Manager client: %v", err)
	}

	// Get the current IAM policy for the project
	policy, err := crmService.Projects.GetIamPolicy(projectID, &cloudresourcemanager.GetIamPolicyRequest{}).Do()
	if err != nil {
		return nil, fmt.Errorf("Failed to get IAM policy for the project: %v", err)
	}

	// Check if the binding already exists to avoid duplicates
	bindingExists := false
	for _, b := range policy.Bindings {
		if b.Role == role {
			for _, m := range b.Members {
				if m == "serviceAccount:"+account.Email {
					bindingExists = true
					break
				}
			}
		}
	}

	// Add the new binding if it doesn't exist
	if !bindingExists {
		policy.Bindings = append(policy.Bindings, &cloudresourcemanager.Binding{
			Role:    role,
			Members: []string{"serviceAccount:" + account.Email},
		})
	}

	// Set the modified policy back to the project
	_, err = crmService.Projects.SetIamPolicy(projectID, &cloudresourcemanager.SetIamPolicyRequest{
		Policy: policy,
	}).Do()
	if err != nil {
		return nil, fmt.Errorf("Failed to set IAM policy for the project: %v", err)
	}

	// Generate and return the service account's key
	key, err := iamService.Projects.ServiceAccounts.Keys.Create(name, &iam.CreateServiceAccountKeyRequest{}).Do()
	if err != nil {
		return nil, fmt.Errorf("Failed to create service account key: %v", err)
	}

	return key, nil
}

func main() {
	accountID := "autoprovisioned6" // Unique ID for the service account
	accountDisplayName := "Firestore Service Account"

	key, err := CreateFirestoreServiceAccount(projectID, accountID, accountDisplayName)
	if err != nil {
		log.Fatalf("Failed to create service account: %v", err)
	}

	// Print the service account secret
	fmt.Println(key.PrivateKeyData)
}
