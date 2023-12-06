# `rpi-keygen` Package README.md

## Overview

The `rpi-keygen` package is a Go-based tool designed for generating and configuring new keys for Raspberry Pi devices. It automates the creation of Firestore service accounts and their associated keys within a Google Cloud Platform project. This tool is especially useful for managing access to Google Cloud services from Raspberry Pi devices.

## Features

- Generates service account keys for Firestore in Google Cloud Platform.
- Handles service account creation if it does not already exist.
- Configures necessary IAM roles and policies.
- Outputs the generated key in a prettified JSON format.

## Prerequisites

- Go programming language installed.
- Google Cloud Platform project with Firestore enabled.
- `google.golang.org/api/cloudresourcemanager/v1` and `google.golang.org/api/iam/v1` packages.
- Google Cloud credentials configured for programmatic access.

## Installation

1. Clone the repository or download the source code.
2. Navigate to the directory containing the package.
3. Build the package using `go build`.

## Usage

1. Run the executable generated from the build process.
2. Input the required service account ID and display name when prompted.
3. The tool will create a new service account (if necessary) and generate a key.
4. The key will be saved in a file named `{account_id}.key` in the current directory.

## Configuration

- Set the `projectID` constant in the code to your Google Cloud Platform project ID.
- Optionally, modify `maxRetries` and `retryDelay` constants for controlling the service account creation wait mechanism.

## Example

```bash
$ ./rpi-keygen
Enter account ID: my-service-account
Enter display name: My Service Account
Service account key saved to my-service-account.key
```

## Error Handling

- The program will log and exit upon encountering any errors during the process.
- Errors include issues with Google Cloud client creation, service account creation, IAM policy updates, or file operations.
