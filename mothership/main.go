package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"

	"github.com/brensch/charging/gen/go/relay"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

type server struct {
	relay.UnimplementedRelayUpdateServiceServer
}

func (s *server) UpdateRelayState(ctx context.Context, in *relay.RelayState) (*relay.UpdateResponse, error) {
	log.Printf("Received relay update: %+v", in)
	return &relay.UpdateResponse{Success: true, Message: "Update received successfully!"}, nil
}

func logInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, _ := metadata.FromIncomingContext(ctx)
	log.Printf("Received Headers: %v", md)
	return handler(ctx, req)
}

func main() {

	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}

	var creds credentials.TransportCredentials
	var err error

	// only host on TLS if running on Cloud Run
	if _, present := os.LookupEnv("K_CONFIGURATION"); present {
		fmt.Println("Running on Cloud Run")
		creds = insecure.NewCredentials()
	} else {
		fmt.Println("Running locally")
		certFile := "./mothership/cert.pem"
		keyFile := "./mothership/key.pem"
		creds, err = credentials.NewServerTLSFromFile(certFile, keyFile)
		if err != nil {
			log.Fatalf("Failed to generate credentials %v", err)
		}
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	opts := []grpc.ServerOption{
		grpc.Creds(creds),
		grpc.UnaryInterceptor(logInterceptor),
	}

	s := grpc.NewServer(opts...)
	relay.RegisterRelayUpdateServiceServer(s, &server{})
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
