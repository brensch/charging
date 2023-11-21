package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

const siteName = "brendo pi"
const configFile = "./siteSettings.json"

const (
	address = "mothership-yufwwel26a-km.a.run.app"
	// address = "localhost"

	// port = ":50051"
	port      = ":443"
	configDir = "./config/"
	secretDir = "./secrets/"
	// keyFile   = secretDir + "remote-device-sa-key.json"
	keyFile = "./testprovision.key"
)

// func generateRandomString(length int) string {
// 	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
// 	result := make([]byte, length)
// 	for i := range result {
// 		result[i] = charset[rand.Intn(len(charset))]
// 	}
// 	return string(result)
// }

type Secret struct {
	Type         string `json:"type"`
	ProjectID    string `json:"project_id"`
	PrivateKeyID string `json:"private_key_id"`
	PrivateKey   string `json:"private_key"`
	ClientEmail  string `json:"client_email"`
	// TODO: confirm that clientID is unique to every key
	ClientID string `json:"client_id"`
}

func extractProjectAndClientID(filePath string) (string, string, error) {
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

func main() {
	ctx := context.Background()

	projectID, clientID, err := extractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	fmt.Println(clientID, projectID)

	// Set up Firestore client
	client, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer client.Close()

	_, err = client.Collection("sitemeta").Doc(clientID).Set(ctx, struct{}{})
	if err != nil {
		log.Fatalf("Failed to write to sitemeta: %v", err)
	}

	// discoverers := []plug.Discoverer{
	// 	&shelly.ShellyDiscoverer{},
	// 	// as we make more plug brands we can add their discoverers here.
	// }

	// plugs := make([]plug.Plug, 0)
	// for _, discoverer := range discoverers {
	// 	discoveredPlugs, err := discoverer.Discover()
	// 	if err != nil {
	// 		log.Fatalf("Failed to discover plugs: %v", err)
	// 	}
	// 	plugs = append(plugs, discoveredPlugs...)
	// }

	// // log details of discovered plugs
	// log.Printf("Discovered %d Plugs", len(plugs))
	// for _, plug := range plugs {
	// 	log.Printf("Discovered Plug: %s", plug)
	// }

	// // check the disk for a key to load our grpc and firestore client
	// // connect to grpc server
	// key, err := os.ReadFile(keyFile)
	// if err != nil {
	// 	log.Fatalf("Failed to load key: %v", err)
	// }
	// tokenSource, err := idtoken.NewTokenSource(ctx, "https://"+address, option.WithCredentialsJSON(key))
	// if err != nil {
	// 	log.Fatalf("new token source: %v", err)
	// }
	// config := &tls.Config{
	// 	InsecureSkipVerify: true,
	// }
	// creds := credentials.NewTLS(config)
	// conn, err := grpc.Dial(
	// 	address+port,
	// 	grpc.WithTransportCredentials(creds),
	// 	grpc.WithPerRPCCredentials(oauth.TokenSource{TokenSource: tokenSource}),
	// )
	// if err != nil {
	// 	log.Fatalf("Did not connect: %v", err)
	// }
	// defer conn.Close()
	// c := contracts.NewUpdateServiceClient(conn)
	// _ = c

	// ticker := time.NewTicker(1 * time.Second)
	// for {
	// 	ControlLoop()
	// 	select {
	// 	case <-ticker.C:
	// 	case <-ctx.Done():
	// 	}
	// }

}
