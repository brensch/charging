package main

import (
	"context"
	"crypto/tls"
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

const (
	// address = "mothership-yufwwel26a-km.a.run.app"
	address = "localhost"

	port    = ":50051"
	keyPath = "./remote-device-sa-key.json"
)

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
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

	// Create a Site with Random Name
	randomSiteName := generateRandomString(10)
	createSiteRes, err := c.CreateSite(ctx, &contracts.CreateSiteRequest{
		Name: randomSiteName,
	})
	if err != nil {
		log.Fatalf("Failed to create site: %v", err)
	}
	log.Printf("Created Site with ID: %s", createSiteRes.SiteId)

	// Generate Multiple Plugs for that Site
	numberOfPlugs := rand.Intn(10) + 1 // let's say a site can have 1 to 10 plugs
	plugIDs := make([]string, numberOfPlugs)
	for i := 0; i < numberOfPlugs; i++ {
		randomPlugName := generateRandomString(8)
		createPlugRes, err := c.CreatePlug(ctx, &contracts.CreatePlugRequest{
			SiteId: createSiteRes.SiteId,
			Name:   randomPlugName,
		})
		if err != nil {
			log.Fatalf("Failed to create plug: %v", err)
		}
		plugIDs[i] = createPlugRes.PlugId
		log.Printf("Created Plug with ID: %s for Site: %s", createPlugRes.PlugId, createSiteRes.SiteId)
	}

	// Upload values for all plugs
	for {
		for _, plugID := range plugIDs {
			reading := &contracts.Reading{
				State:       contracts.PlugState(rand.Intn(5)),
				Current:     rand.Float64() * 1000,
				Voltage:     110 + rand.Float64()*10,
				PowerFactor: rand.Float64()*2 - 1,
				Timestamp:   time.Now().Unix(),
			}

			response, err := c.UpdatePlug(ctx, &contracts.UpdatePlugRequest{
				PlugId:  plugID,
				SiteId:  createSiteRes.SiteId,
				Reading: reading,
			})
			if err != nil {
				log.Fatalf("Could not update: %v", err)
			}

			log.Print(reading)

			log.Printf("Updated Plug ID: %s, Site ID: %s, Status: %v, Message: %s", plugID, createSiteRes.SiteId, response.Success, response.Message)
		}
		time.Sleep(5 * time.Second)
	}
}
