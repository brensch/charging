package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/electrical/demo"
	"github.com/brensch/charging/electrical/shelly"
	"github.com/brensch/charging/gen/go/contracts"
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

	readingsBufferSize = 100
	readingsCollection = "readings"
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
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer fs.Close()

	_, err = fs.Collection("sitemeta").Doc(clientID).Set(ctx, struct{}{})
	if err != nil {
		log.Fatalf("Failed to write to sitemeta: %v", err)
	}

	discoverers := []electrical.Discoverer{
		shelly.InitShellyDiscoverer(clientID),
		demo.InitDiscoverer(clientID),
		// as we make more plug brands we can add their discoverers here.
	}

	plugs := make([]electrical.Plug, 0)
	fuzes := make([]electrical.Fuze, 0)
	for _, discoverer := range discoverers {
		discoveredPlugs, discoveredFuzes, err := discoverer.Discover()
		if err != nil {
			log.Fatalf("Failed to discover plugs: %v", err)
		}
		plugs = append(plugs, discoveredPlugs...)
		fuzes = append(fuzes, discoveredFuzes...)
	}

	// generate the local versions of plugs
	var localPlugs []*PlugLocalState
	for _, plug := range plugs {
		localPlug, err := InitPlugLocalState(ctx, fs, plug)
		if err != nil {
			log.Fatalf("failed to init local plug: %+v", err)
		}
		localPlugs = append(localPlugs, localPlug)
	}

	// generate the local versions of plugs
	var localFuzes []*FuzeLocalState
	for _, fuze := range fuzes {
		localFuze, err := InitFuzeLocalState(ctx, fs, fuze)
		if err != nil {
			log.Fatalf("failed to init local fuze: %+v", err)
		}
		localFuzes = append(localFuzes, localFuze)
	}

	// TODO: check if there are any plugs we don't have locally that do exist in firestore

	// sends data to firestore once we get enough readings
	readingsCHAN := make(chan *contracts.Reading, 10)
	go func() {
		var readings []*contracts.Reading
		for reading := range readingsCHAN {
			readings = append(readings, reading)

			if len(readings) < readingsBufferSize {
				continue
			}

			// if we've hit chunk size, flush to fs and reset list
			readingChunk := &contracts.ReadingChunk{
				SiteId:   clientID,
				Readings: readings,
			}
			_, _, err := fs.Collection(readingsCollection).Add(ctx, readingChunk)
			if err != nil {
				log.Println("failed to flush reading chunk", err)
				continue
			}
			log.Println("flushed reading chunk")

			readings = []*contracts.Reading{}

		}
	}()

	ticker := time.NewTicker(1 * time.Second)
	for {
		ControlLoop(localPlugs, localFuzes, readingsCHAN)
		select {
		case <-ticker.C:
		case <-ctx.Done():
		}
	}

}
