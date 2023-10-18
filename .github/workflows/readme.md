## Set up identity federation

Setup pool:

```
gcloud iam workload-identity-pools create "github-pool" \
  --project="selfforecasting" \
  --location="global" \
  --display-name="github-pool"
```

Setup workload:

```
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="selfforecasting" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="github-provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.aud=assertion.aud,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

Allow the identity provider to impersonate the service account.

The project number is found in the IAM console as the first part of various service accounts. The service account needs to be created.

```
gcloud iam service-accounts add-iam-policy-binding "github-action@selfforecasting.iam.gserviceaccount.com" \
  --project="selfforecasting" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/313346895426/locations/global/workloadIdentityPools/github-pool/attribute.repository/brensch/nembot"
```
