package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/electrical/demo"
	"github.com/brensch/charging/electrical/shelly"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
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

	CollectionSiteSettings = "site_settings"

	topicID = "test_topic"
)

func main() {
	ctx := context.Background()

	projectID, clientID, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	log.Println("got pubsub client")

	topic := client.Topic(topicID)

	fmt.Println(clientID, projectID)

	// Set up Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer fs.Close()

	err = ensureSiteSettingsDoc(ctx, fs, clientID)
	if err != nil {
		log.Fatalf("failed to ensure site settings: %+v", err)
	}

	_ = shelly.ConvertToPlugState(false)

	discoverers := []electrical.Discoverer{
		// shelly.InitShellyDiscoverer(clientID),
		demo.InitDiscoverer(clientID),
		// as we make more plug brands we can add their discoverers here.
	}

	plugs := make([]electrical.Plug, 0)
	fuzes := make([]electrical.Fuze, 0)
	for _, discoverer := range discoverers {
		fmt.Println("discovering")
		discoveredPlugs, discoveredFuzes, err := discoverer.Discover()
		if err != nil {
			log.Fatalf("Failed to discover plugs: %v", err)
		}
		plugs = append(plugs, discoveredPlugs...)
		fuzes = append(fuzes, discoveredFuzes...)
	}
	fmt.Println("finished discovering")

	// generate the local versions of plugs
	var localPlugs []*LocalPlugState
	for _, plug := range plugs {
		fmt.Println("initialising local plug state", plug.ID())
		localPlug, err := InitLocalPlugState(ctx, fs, plug)
		if err != nil {
			log.Fatalf("failed to init local plug: %+v", err)
		}
		localPlugs = append(localPlugs, localPlug)
	}

	// generate the local versions of plugs
	var localFuzes []*LocalFuzeState
	for _, fuze := range fuzes {
		fmt.Println("initialising local fuze state", fuze.ID())

		localFuze, err := InitLocalFuzeState(ctx, fs, fuze)
		if err != nil {
			log.Fatalf("failed to init local fuze: %+v", err)
		}
		localFuzes = append(localFuzes, localFuze)
	}

	// TODO: check if there are any plugs we don't have locally that do exist in firestore

	// sends data to firestore once we get enough readings
	// readingsCHAN := make(chan *contracts.Reading, 10)
	// go func() {
	// 	var readings []*contracts.Reading
	// 	for reading := range readingsCHAN {
	// 		readings = append(readings, reading)

	// 		if len(readings) < readingsBufferSize {
	// 			continue
	// 		}

	// 		// if we've hit chunk size, flush to fs and reset list
	// 		readingChunk := &contracts.ReadingChunk{
	// 			SiteId:   clientID,
	// 			Readings: readings,
	// 		}
	// 		// _, _, err := fs.Collection(readingsCollection).Add(ctx, readingChunk)
	// 		// if err != nil {
	// 		// 	log.Println("failed to flush reading chunk", err)
	// 		// 	continue
	// 		// }
	// 		// log.Println("flushed reading chunk")

	// 		readings = []*contracts.Reading{}

	// 		// Block until the result is returned and a server-generated
	// 		// ID is returned for the published message.
	// 		id, err := result.Get(ctx)
	// 		if err != nil {
	// 			log.Fatalf("Failed to publish: %v", err)
	// 		}

	// 		fmt.Printf("Published a message; msg ID: %v\n", id)

	// 	}
	// }()

	ticker := time.NewTicker(1 * time.Second)
	for {
		select {
		case <-ticker.C:
		case <-ctx.Done():
		}
		readings, err := GetReadings(ctx, localPlugs, localFuzes)
		if err != nil {
			fmt.Println("got error reading readings")
			continue
		}
		for _, reading := range readings {
			fmt.Println("got reading", reading.Voltage)
		}
		err = SendReadings(ctx, topic, clientID, readings)
		if err != nil {
			fmt.Println("failed to send readings")
			continue
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
