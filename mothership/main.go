package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net"
	"os"

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

func (s *server) UpdateSite(ctx context.Context, req *contracts.UpdateSiteRequest) (*contracts.UpdateResponse, error) {
	_, err := s.firestoreClient.Collection("sites").Doc(req.SiteId).Set(ctx, req.Reading, firestore.MergeAll)
	if err != nil {
		return &contracts.UpdateResponse{Success: false, Message: err.Error()}, nil
	}
	return &contracts.UpdateResponse{Success: true}, nil
}

func (s *server) UpdateSiteSetting(ctx context.Context, req *contracts.UpdateSiteSettingRequest) (*contracts.UpdateResponse, error) {
	_, err := s.firestoreClient.Collection("siteSettings").Doc(req.SiteId).Set(ctx, req.Reading, firestore.MergeAll)
	if err != nil {
		return &contracts.UpdateResponse{Success: false, Message: err.Error()}, nil
	}
	return &contracts.UpdateResponse{Success: true}, nil
}

func (s *server) UpdatePlug(ctx context.Context, req *contracts.UpdatePlugRequest) (*contracts.UpdateResponse, error) {
	// Reference to the plug document
	docRef := s.firestoreClient.Collection("plugs").Doc(req.PlugId)

	// Update the plug document by appending the new reading to the "readings" array field
	_, err := docRef.Update(ctx, []firestore.Update{
		{
			Path:  "readings",
			Value: firestore.ArrayUnion(req.Reading),
		},
	})
	if err != nil {
		return &contracts.UpdateResponse{Success: false, Message: err.Error()}, nil
	}
	return &contracts.UpdateResponse{Success: true}, nil
}

func (s *server) UpdatePlugSetting(ctx context.Context, req *contracts.UpdatePlugSettingRequest) (*contracts.UpdateResponse, error) {
	_, err := s.firestoreClient.Collection("plugSettings").Doc(req.PlugId).Set(ctx, map[string]interface{}{
		"name":     req.Name,
		"site_id":  req.SiteId,
		"strategy": req.Strategy,
	}, firestore.MergeAll)
	if err != nil {
		return &contracts.UpdateResponse{Success: false, Message: err.Error()}, nil
	}
	return &contracts.UpdateResponse{Success: true}, nil
}

func (s *server) CreateSite(ctx context.Context, req *contracts.CreateSiteRequest) (*contracts.CreateSiteResponse, error) {
	// Generate a random site_id for the new site
	siteID := fmt.Sprintf("site-%d", rand.Intn(1000000))

	// Create Site object
	site := &contracts.Site{
		SiteId:   siteID,
		SiteName: req.Name,
	}

	// Create SiteSetting object (assuming it requires the name, as the schema wasn't specified)
	siteSetting := &contracts.SiteSetting{
		Name:   req.Name,
		SiteId: siteID,
	}

	// Save Site object to Firestore
	_, err := s.firestoreClient.Collection("sites").Doc(siteID).Set(ctx, site)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to create site: %v", err)
	}

	// Save SiteSetting object to Firestore
	_, err = s.firestoreClient.Collection("sitesettings").Doc(siteID).Set(ctx, siteSetting)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to create site setting: %v", err)
	}

	return &contracts.CreateSiteResponse{
		SiteId: siteID,
	}, nil
}

func (s *server) CreatePlug(ctx context.Context, req *contracts.CreatePlugRequest) (*contracts.CreatePlugResponse, error) {
	// Generate a random plug_id for the new plug
	plugID := fmt.Sprintf("plug-%d", rand.Intn(1000000))

	// Create Plug object
	plug := &contracts.Plug{
		PlugId: plugID,
		SiteId: req.SiteId,
	}

	// Create PlugSettings object (assuming it requires the name, as the schema wasn't specified)
	plugSetting := &contracts.PlugSettings{
		Name:   req.Name,
		SiteId: req.SiteId,
		PlugId: plugID,
	}

	// Save Plug object to Firestore
	_, err := s.firestoreClient.Collection("plugs").Doc(plugID).Set(ctx, plug)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to create plug: %v", err)
	}

	// Save PlugSettings object to Firestore
	_, err = s.firestoreClient.Collection("plugsettings").Doc(plugID).Set(ctx, plugSetting)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to create plug setting: %v", err)
	}

	return &contracts.CreatePlugResponse{
		PlugId: plugID,
	}, nil
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
