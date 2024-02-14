package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"google.golang.org/api/option"
)

const (
	keyFile                 = "./mothership.key"
	TopicNameTelemetry      = "telemetry"
	TopicNameCommandResults = "command_results"
	TopicNameNewDevices     = "new_devices"

	secondsToStore = 10
	statesToStore  = 100

	influxOrg         = "Niquist"
	influxBucketNEM   = "nem"
	influxBucketSites = "opc"
	influxHost        = "https://us-east-1-1.aws.cloud2.influxdata.com"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	projectID, _, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	// init google pubsub client
	ps, err := pubsub.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	// init ifdb
	options := influxdb2.DefaultOptions()
	options.SetBatchSize(10)
	options.SetFlushInterval(10)
	influxTokenBytes, err := os.ReadFile("influx.key")
	if err != nil {
		log.Fatalf("problem reading influx token: %v", err)
	}
	ifClient := influxdb2.NewClientWithOptions(influxHost, string(influxTokenBytes), options)
	ifClientWriteSites := ifClient.WriteAPI(influxOrg, influxBucketSites)
	defer ifClientWriteSites.Flush()

	// init Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer fs.Close()

	// this is used to store all the state machines for each plug
	stateMachines := InitStateMachineCollection()

	// get all plugstatuses on load and populate the statemachine collection.
	plugStatusQuery := fs.Collection(common.CollectionPlugStatus).Query
	plugStatuses, err := plugStatusQuery.Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("couldn't get plug statuses", err)
	}
	for _, plugStatusDoc := range plugStatuses {
		var plugStatus *contracts.PlugStatus
		plugStatusDoc.DataTo(&plugStatus)
		stateMachines.AddStateMachine(InitPlugStateMachine(ctx, fs, ps, ifClientWriteSites, plugStatus.GetSiteId(), plugStatus.GetLatestReading()))
	}

	go ListenForNewDevices(ctx, fs, ps, stateMachines)
	go ListenForUserRequests(ctx, fs, stateMachines)
	go ListenForDeviceCommandResponses(ctx, fs, ps, stateMachines)
	go ListenForTelemetry(ctx, fs, ps, ifClientWriteSites, stateMachines)

	// Setup signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan // Block until a signal is received

	// Perform flush and other cleanup operations before exiting
	log.Println("Flushing InfluxDB data and shutting down")
	ifClientWriteSites.Flush()
	log.Println("Flushing complete")

	cancel()

	// Additional cleanup code can go here

	log.Println("Shutdown complete")

}
