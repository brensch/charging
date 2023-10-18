package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"github.com/brensch/charging/gen/go/relay"

	"google.golang.org/grpc"
)

const (
	port = ":50051"
)

type server struct {
	relay.UnimplementedRelayUpdateServiceServer
}

func (s *server) UpdateRelayState(ctx context.Context, in *relay.RelayState) (*relay.UpdateResponse, error) {
	log.Printf("Received relay update: %+v", in)
	return &relay.UpdateResponse{Success: true, Message: "Update received successfully!"}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	fmt.Println("sup")

	s := grpc.NewServer()
	relay.RegisterRelayUpdateServiceServer(s, &server{})
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
