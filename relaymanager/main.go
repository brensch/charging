package main

import (
	"context"
	"log"
	"math/rand"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/electrical/tasmota"
	"github.com/brensch/charging/gen/go/contracts"

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

	log.Println(siteID, projectID)

	// discover plugs and fuzes
	discoverers := []electrical.Discoverer{
		// shelly.InitShellyDiscoverer(siteID),
		// sonoff.InitSonoffDiscoverer(siteID),
		tasmota.InitTasmotaDiscoverer(siteID),
		// demo.InitDiscoverer(siteID),
		// as we make more plug brands we can add their discoverers here.
	}

	plugs := make(map[string]electrical.Plug, 0)
	fuzes := make(map[string]electrical.Fuze, 0)
	for _, discoverer := range discoverers {
		log.Println("discovering", discoverer)
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
	log.Println("finished discovering, informing mothership of devices")

	err = AnnounceDevices(ctx, ps, siteID, plugs, fuzes)
	if err != nil {
		log.Fatalf("got error announcing devices: %+v", err)
	}
	// command listening loop
	log.Println("listening for commands")
	go ListenForCommands(ctx, ps, siteID, plugs)

	log.Println("start reader loop")
	ticker := time.NewTicker(2 * time.Second)
	for {
		select {
		case <-ticker.C:
		case <-ctx.Done():
		}
		readings, err := GetReadings(ctx, plugs)
		if err != nil {
			log.Println("got error reading readings")
			continue
		}

		readingChunk := &contracts.ReadingChunk{
			SiteId:   siteID,
			Readings: readings,
		}

		readingBytes, err := common.PackData(readingChunk)
		if err != nil {
			log.Println("failed to pack readings", err)
			continue
		}

		res := telemetrySendTopic.Publish(ctx, &pubsub.Message{
			Data: readingBytes,
		})
		_, err = res.Get(ctx)
		if err != nil {
			log.Println("failed to send readings", err)
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
