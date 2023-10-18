package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/brensch/charging/gen/go/relay"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

const (
	address = "localhost:50051"
)

func main() {

	fmt.Println("yol")

	conn, err := grpc.Dial(address, grpc.WithBlock(), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Did not connect: %v", err)
	}
	defer conn.Close()
	c := relay.NewRelayUpdateServiceClient(conn)

	fmt.Println("yo")

	for {
		// Generating random data
		state := &relay.RelayState{
			IsOn:           rand.Intn(2) == 1,
			CurrentReading: rand.Float64() * 1000,   // Random wattage between 0 and 1000
			VoltageReading: 110 + rand.Float64()*10, // Random voltage between 110 and 120
			PowerFactor:    rand.Float64()*2 - 1,    // Random power factor between -1 and 1
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
