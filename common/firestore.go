package common

import (
	"encoding/json"
	"os"
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
