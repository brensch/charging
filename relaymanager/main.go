package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/api/idtoken"
	"google.golang.org/api/option"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/oauth"
)

const siteName = "brendo pi"
const configFile = "./siteSettings.json"

const (
	// address = "mothership-yufwwel26a-km.a.run.app"
	address = "localhost"

	port = ":50051"
	// port    = ":443"
	keyPath = "./remote-device-sa-key.json"
)

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}

func main() {
	ctx := context.Background()

	key, err := os.ReadFile(keyPath)
	if err != nil {
		log.Fatalf("Failed to load key: %v", err)
	}

	// connect to grpc server
	tokenSource, err := idtoken.NewTokenSource(ctx, "https://"+address, option.WithCredentialsJSON(key))
	if err != nil {
		log.Fatalf("new token source: %v", err)
	}
	config := &tls.Config{
		InsecureSkipVerify: true,
	}
	creds := credentials.NewTLS(config)
	conn, err := grpc.Dial(
		address+port,
		grpc.WithTransportCredentials(creds),
		grpc.WithPerRPCCredentials(oauth.TokenSource{TokenSource: tokenSource}),
	)
	if err != nil {
		log.Fatalf("Did not connect: %v", err)
	}
	defer conn.Close()

	c := contracts.NewUpdateServiceClient(conn)

	// Check for the presence of config file and load it if it exists
	var loadedSiteSettings *contracts.SiteSetting
	if _, err := os.Stat(configFile); err == nil {
		data, err := os.ReadFile(configFile)
		if err != nil {
			log.Fatalf("Failed to read config file: %v", err)
		}
		err = json.Unmarshal(data, &loadedSiteSettings)
		if err != nil {
			log.Fatalf("Failed to unmarshal config file: %v", err)
		}
	}

	if loadedSiteSettings == nil {
		// Create a Site with static name
		createSiteRes, err := c.CreateSite(ctx, &contracts.CreateSiteRequest{
			Name: siteName,
		})
		if err != nil {
			log.Fatalf("Failed to create site: %v", err)
		}
		log.Printf("Created Site with ID: %s", createSiteRes.SiteId)

		// Generate Multiple Plugs for that Site locally
		numberOfPlugs := rand.Intn(10) + 1
		plugs := make([]*contracts.Plug, numberOfPlugs)
		plugSettings := make([]*contracts.PlugSettings, numberOfPlugs)
		for i := 0; i < numberOfPlugs; i++ {
			plugID := generateRandomString(5) // Assuming plug IDs are also random strings
			plugs[i] = &contracts.Plug{
				PlugId: plugID,
				Reading: &contracts.Reading{
					State:       contracts.PlugState(rand.Intn(5)),
					Current:     rand.Float64() * 1000,
					Voltage:     110 + rand.Float64()*10,
					PowerFactor: rand.Float64()*2 - 1,
					Timestamp:   time.Now().Unix(),
				},
			}
			plugSettings[i] = &contracts.PlugSettings{
				Name:     "name me",
				PlugId:   plugID,
				Strategy: &contracts.PlugStrategy{}, // This needs to be set properly
			}
			log.Printf("Generated Plug with ID: %s for Site: %s", plugID, createSiteRes.SiteId)
		}
		// Save SiteSetting to disk
		siteSettings := &contracts.SiteSetting{
			Name:   siteName,
			SiteId: createSiteRes.SiteId,
			Plugs:  plugSettings,
		}

		data, err := json.Marshal(siteSettings)
		if err != nil {
			log.Fatalf("Failed to marshal site settings: %v", err)
		}
		err = os.WriteFile(configFile, data, 0644)
		if err != nil {
			log.Fatalf("Failed to write site settings to disk: %v", err)
		}

		loadedSiteSettings = siteSettings
	} else {
		log.Printf("Loaded site settings from disk for Site ID: %s", loadedSiteSettings.SiteId)
	}

	res, err := c.UpdateSiteSetting(ctx, &contracts.UpdateSiteSettingsRequest{SiteSettings: loadedSiteSettings})
	if err != nil {
		log.Fatalf("Failed to store site settings: %v", err)
	}
	log.Print("saved response: ", res)

	// Continuous loop generating random readings for all plugs and updating the site
	for {
		plugs := make([]*contracts.Plug, len(loadedSiteSettings.Plugs))

		for i, plugSetting := range loadedSiteSettings.Plugs {
			reading := &contracts.Reading{
				State:       contracts.PlugState(rand.Intn(5)),
				Current:     rand.Float64() * 1000,
				Voltage:     110 + rand.Float64()*10,
				PowerFactor: rand.Float64()*2 - 1,
				Timestamp:   time.Now().Unix(),
			}

			plugs[i] = &contracts.Plug{
				PlugId:  plugSetting.PlugId,
				Reading: reading,
			}

			log.Printf("Generated Reading for Plug ID: %s, Current: %f, Voltage: %f", plugSetting.PlugId, reading.Current, reading.Voltage)
		}

		site := &contracts.Site{
			SiteId: loadedSiteSettings.SiteId,
			Plugs:  plugs,
			State:  contracts.SiteState_SiteState_ONLINE,
		}

		_, err := c.UpdateSite(ctx, &contracts.UpdateSiteRequest{UpdatedSite: site})
		if err != nil {
			log.Fatalf("Failed to update site: %v", err)
		}

		log.Printf("Updated Site with ID: %s with new plug readings", loadedSiteSettings.SiteId)

		time.Sleep(10 * time.Second)
	}
}
