package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	"github.com/brensch/charging/gen/go/contracts"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type server struct {
	contracts.UnimplementedUpdateServiceServer
	firestoreClient *firestore.Client
}

func (s *server) CreateSite(ctx context.Context, req *contracts.CreateSiteRequest) (*contracts.CreateSiteResponse, error) {
	siteRef := s.firestoreClient.Collection("sites").NewDoc()
	_, err := siteRef.Set(ctx, map[string]interface{}{
		"name": req.GetName(),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create site: %v", err)
	}
	return &contracts.CreateSiteResponse{SiteId: siteRef.ID}, nil
}

func (s *server) UpdateSite(ctx context.Context, req *contracts.UpdateSiteRequest) (*contracts.UpdateSiteResponse, error) {
	siteRef := s.firestoreClient.Collection("sites").Doc(req.GetUpdatedSite().GetSiteId())
	// Extract the plug IDs
	plugIDs := make([]string, len(req.GetUpdatedSite().GetPlugs()))
	for i, plug := range req.GetUpdatedSite().GetPlugs() {
		plugIDs[i] = plug.GetPlugId()
	}
	// Set the PlugIds field
	req.GetUpdatedSite().PlugIds = plugIDs
	req.GetUpdatedSite().LastUpdatedMs = time.Now().UnixMilli()
	_, err := siteRef.Set(ctx, req.GetUpdatedSite())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update site: %v", err)
	}
	return &contracts.UpdateSiteResponse{SiteId: siteRef.ID, Message: "Updated Successfully"}, nil
}

func (s *server) UpdateSiteSetting(ctx context.Context, req *contracts.UpdateSiteSettingsRequest) (*contracts.UpdateSiteSettingsResponse, error) {
	siteRef := s.firestoreClient.Collection("sitesettings").Doc(req.GetSiteSettings().GetSiteId())
	_, err := siteRef.Set(ctx, req.GetSiteSettings())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update site settings: %v", err)
	}
	return &contracts.UpdateSiteSettingsResponse{SiteId: siteRef.ID, Message: "Updated Settings Successfully"}, nil
}

func logInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, _ := metadata.FromIncomingContext(ctx)
	log.Printf("Received Headers: %v", md)
	return handler(ctx, req)
}

func initFirestoreClient(ctx context.Context) (*firestore.Client, error) {
	client, err := firestore.NewClient(ctx, "charging-402405")
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
		return nil, err
	}

	return client, nil
}

func main() {

	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}

	var creds credentials.TransportCredentials
	var err error

	ctx := context.Background()

	// Initialize Firestore
	firestoreClient, err := initFirestoreClient(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize Firestore: %v", err)
	}

	defer firestoreClient.Close()

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
	contracts.RegisterUpdateServiceServer(s, &server{firestoreClient: firestoreClient})
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
