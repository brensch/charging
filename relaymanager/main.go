package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/electrical/sonoff"

	"cloud.google.com/go/pubsub"
	"google.golang.org/api/option"
)

const (
	port      = ":443"
	configDir = "./config/"
	secretDir = "./secrets/"
	keyFile   = "./gcp.key"
)

func main() {
	ctx := context.Background()

	projectID, siteID, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	ps, err := pubsub.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	log.Println("got pubsub client")

	telemetrySendTopic := ps.Topic(common.TopicNameTelemetry)

	fmt.Println(siteID, projectID)

	// discover plugs and fuzes
	discoverers := []electrical.Discoverer{
		// shelly.InitShellyDiscoverer(siteID),
		sonoff.InitSonoffDiscoverer(siteID),
		// demo.InitDiscoverer(siteID),
		// as we make more plug brands we can add their discoverers here.
	}

	plugs := make(map[string]electrical.Plug, 0)
	fuzes := make(map[string]electrical.Fuze, 0)
	for _, discoverer := range discoverers {
		fmt.Println("discovering")
		discoveredPlugs, discoveredFuzes, err := discoverer.Discover(ctx)
		if err != nil {
			log.Fatalf("Failed to discover plugs: %v", err)
		}
		for _, plug := range discoveredPlugs {
			log.Println("found plug: ", plug.ID())
			plugs[plug.ID()] = plug
		}
		for _, fuze := range discoveredFuzes {
			log.Println("found fuze: ", fuze.ID())
			fuzes[fuze.ID()] = fuze
		}
	}
	fmt.Println("finished discovering, informing mothership of devices")

	err = AnnounceDevices(ctx, ps, siteID, plugs, fuzes)
	if err != nil {
		log.Fatalf("got error announcing devices: %+v", err)
	}
	// command listening loop
	go ListenForCommands(ctx, ps, siteID, plugs)

	ticker := time.NewTicker(1 * time.Second)
	for {
		select {
		case <-ticker.C:
		case <-ctx.Done():
		}
		readings, err := GetReadings(ctx, plugs)
		if err != nil {
			fmt.Println("got error reading readings")
			continue
		}

		err = SendReadings(ctx, telemetrySendTopic, siteID, readings)
		if err != nil {
			fmt.Println("failed to send readings", err)
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
