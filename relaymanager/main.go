package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"sync"
	"time"

	"github.com/skip2/go-qrcode"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/electrical/demo"
	"github.com/brensch/charging/gen/go/contracts"

	"cloud.google.com/go/pubsub"
	"google.golang.org/api/option"
)

const (
	port      = ":443"
	configDir = "./config/"
	secretDir = "./secrets/"
	keyFile   = "./gcp.key"
	webPort   = ":8080" // Port for the web server
)

var (
	mu    sync.Mutex
	plugs map[string]electrical.Plug
	fuzes map[string]electrical.Fuze
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
		// tasmota.InitTasmotaDiscoverer(siteID),
		demo.InitDiscoverer(siteID),
	}

	plugs = make(map[string]electrical.Plug, 0)
	fuzes = make(map[string]electrical.Fuze, 0)
	for _, discoverer := range discoverers {
		log.Println("discovering", discoverer)
		discoveredPlugs, discoveredFuzes, err := discoverer.Discover(ctx)
		if err != nil {
			log.Fatalf("Failed to discover plugs: %v", err)
		}
		mu.Lock()
		for _, plug := range discoveredPlugs {
			log.Println("found plug: ", plug.ID())
			plugs[plug.ID()] = plug
		}
		for _, fuze := range discoveredFuzes {
			log.Println("found fuze: ", fuze.ID())
			fuzes[fuze.ID()] = fuze
		}
		mu.Unlock()
	}
	log.Println("finished discovering, informing mothership of devices")

	err = AnnounceDevices(ctx, ps, siteID, plugs, fuzes)
	if err != nil {
		log.Fatalf("got error announcing devices: %+v", err)
	}

	go ListenForCommands(ctx, ps, siteID, plugs)

	go func() {
		log.Println("starting web server")
		http.HandleFunc("/", handleStatusPage)
		log.Fatal(http.ListenAndServe(webPort, nil))
	}()

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

func handleStatusPage(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	fmt.Fprintf(w, `<html>
	<head>
		<meta http-equiv='refresh' content='1'>
		<style>
			.container {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
			}
			.plug {
				border: 1px solid black;
				padding: 10px;
				margin: 10px;
				flex: 0 0 30%; /* 1/3 of the screen, accounting for margins */
				box-sizing: border-box;
			}
		</style>
	</head>
	<body>
		<h1>Plugs and Fuzes Status</h1>
		<h2>Plugs:</h2>
		<div class="container">`)

	// Extract and sort plug IDs
	plugIDs := make([]string, 0, len(plugs))
	for id := range plugs {
		plugIDs = append(plugIDs, id)
	}
	sort.Strings(plugIDs)

	// Iterate over the sorted plug IDs
	for _, id := range plugIDs {
		plug := plugs[id]
		reading, err := plug.GetReading()
		if err != nil {
			fmt.Fprintf(w, "<div class='plug'>")
			fmt.Fprintf(w, "<h3>%s</h3>", plug.ID())
			fmt.Fprintf(w, "<p>Error getting reading</p>")
			fmt.Fprintf(w, "</div>")
			continue
		}

		// Generate QR Code
		url := fmt.Sprintf(`https://charging-402405.web.app/plug/%s`, plug.ID())
		var qrCodeDataURL string
		qr, err := qrcode.New(url, qrcode.Medium)
		if err != nil {
			log.Println("failed to generate QR code", err)
		} else {
			var pngData bytes.Buffer
			err = qr.Write(200, &pngData)
			if err != nil {
				log.Println("failed to write QR code png", err)
			} else {
				qrCodeDataURL = "data:image/png;base64," + base64.StdEncoding.EncodeToString(pngData.Bytes())
			}
		}

		fmt.Fprintf(w, "<div class='plug'>")
		fmt.Fprintf(w, "<h3>%s</h3>", plug.ID())
		fmt.Fprintf(w, "<p>State: %v</p>", reading.State)
		fmt.Fprintf(w, "<p>Current: %v amps</p>", reading.Current)
		fmt.Fprintf(w, "<p>Voltage: %v volts</p>", reading.Voltage)
		fmt.Fprintf(w, "<p>Power: %v watts</p>", reading.Voltage*reading.Current)
		fmt.Fprintf(w, "<p>Power Factor: %v</p>", reading.PowerFactor)
		fmt.Fprintf(w, "<p>Timestamp: %v</p>", reading.TimestampMs)
		fmt.Fprintf(w, "<p>Plug ID: %s</p>", reading.PlugId)
		fmt.Fprintf(w, "<p>Fuze ID: %s</p>", reading.FuzeId)
		if qrCodeDataURL != "" {
			fmt.Fprintf(w, "<img src='%s' alt='QR Code' />", qrCodeDataURL)
		} else {
			fmt.Fprintf(w, "<p>QR Code generation failed</p>")
		}
		fmt.Fprintf(w, "</div>")
	}

	fmt.Fprintf(w, "</div>") // Close the container div

	fmt.Fprintf(w, "<h2>Fuzes:</h2><ul>")
	for id, fuze := range fuzes {
		fmt.Fprintf(w, "<li>%s: %s</li>", id, fuze.SiteID())
	}
	fmt.Fprintf(w, "</ul></body></html>")
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	s := make([]byte, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}
