package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/brensch/charging/gen/go/relay"
	"google.golang.org/api/idtoken"
	"google.golang.org/api/option"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/oauth"
)

const (
	address = "mothership-yufwwel26a-km.a.run.app"
	port    = ":443"
	// address  = "localhost:50051"
	keyPath = "./remote-device-sa-key.json"
	// audience = "https://mothership-yufwwel26a-km.a.run.app"
)

func main() {
	// Load the service account key and create a JWT config
	ctx := context.Background()

	key, err := os.ReadFile(keyPath)
	if err != nil {
		log.Fatalf("Failed to load key: %v", err)
	}

	tokenSource, err := idtoken.NewTokenSource(ctx, "https://"+address, option.WithCredentialsJSON(key))
	if err != nil {
		log.Fatalf("new token source: %v", err)
	}

	// Setup TLS to skip server name verification
	config := &tls.Config{}
	creds := credentials.NewTLS(config)

	// Create a gRPC client connection
	fmt.Println(address)
	conn, err := grpc.Dial(
		address+port,
		grpc.WithTransportCredentials(creds),
		grpc.WithPerRPCCredentials(oauth.TokenSource{TokenSource: tokenSource}),
	)
	if err != nil {
		log.Fatalf("Did not connect: %v", err)
	}
	defer conn.Close()

	c := relay.NewRelayUpdateServiceClient(conn)

	for {
		// Generating random data (as provided)
		state := &relay.RelayState{
			IsOn:           rand.Intn(2) == 1,
			CurrentReading: rand.Float64() * 1000,
			VoltageReading: 110 + rand.Float64()*10,
			PowerFactor:    rand.Float64()*2 - 1,
			Timestamp:      time.Now().Unix(),
		}

		response, err := c.UpdateRelayState(context.Background(), state)
		if err != nil {
			log.Fatalf("Could not update: %v", err)
		}

		log.Printf("Update status: %v, Message: %s", response.Success, response.Message)
		time.Sleep(5 * time.Second)
	}
}
