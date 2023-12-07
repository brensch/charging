package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
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

	readingsBufferSize = 500
	readingsCollection = "readings"
)

func main() {
	ctx := context.Background()

	projectID, clientID, err := common.ExtractProjectAndClientID(keyFile)
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
		// demo.InitDiscoverer(clientID),
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

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	s := make([]byte, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}
