package main

import (
	"context"
	"crypto/tls"
	"log"
	"math/rand"
	"os"

	"github.com/brensch/charging/gen/go/contracts"
	"github.com/brensch/charging/plug"
	"github.com/brensch/charging/plug/shelly"
	"google.golang.org/api/idtoken"
	"google.golang.org/api/option"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/oauth"
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
	keyFile   = secretDir + "remote-device-sa-key.json"
)

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}

func main2() {
	ctx := context.Background()

	discoverers := []plug.Discoverer{
		&shelly.ShellyDiscoverer{},
		// as we make more plug brands we can add their discoverers here.
	}

	plugs := make([]plug.Plug, 0)
	for _, discoverer := range discoverers {
		discoveredPlugs, err := discoverer.Discover()
		if err != nil {
			log.Fatalf("Failed to discover plugs: %v", err)
		}
		plugs = append(plugs, discoveredPlugs...)
	}

	// log details of discovered plugs
	log.Printf("Discovered %d Plugs", len(plugs))
	for _, plug := range plugs {
		log.Printf("Discovered Plug: %s", plug)
	}

	// check the disk for a key to load our grpc and firestore client
	// connect to grpc server
	key, err := os.ReadFile(keyFile)
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
	_ = c

}
