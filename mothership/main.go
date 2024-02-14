package main

import (
	"context"
	"fmt"
	"log"
	"os"

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

	secondsToStore = 10
	statesToStore  = 100

	influxOrg         = "Niquist"
	influxBucketNEM   = "nem"
	influxBucketSites = "opc"
	influxHost        = "https://us-east-1-1.aws.cloud2.influxdata.com"
)

func main() {
	ctx := context.Background()

	projectID, _, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		log.Fatalf("Failed to get identity: %v", err)
	}

	ps, err := pubsub.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	// telemetrySub := client.Subscription(telemetryTopicName)
	// commandResultsSub := client.Subscription(commandResultsTopicName)

	options := influxdb2.DefaultOptions()
	options.SetBatchSize(10)
	options.SetFlushInterval(10)

	influxTokenBytes, err := os.ReadFile("influx.key")
	if err != nil {
		log.Fatalf("problem reading influx token: %v", err)
	}
	fmt.Println(string(influxTokenBytes))

	// init ifdb
	ifClient := influxdb2.NewClientWithOptions(influxHost, string(influxTokenBytes), options)
	ifClientWriteSites := ifClient.WriteAPI(influxOrg, influxBucketSites)
	defer ifClientWriteSites.Flush()

	// Set up Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer fs.Close()

	// this is used to store all the state machines for each plug
	stateMachines := InitStateMachineCollection()

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

	go ListenForUserRequests(ctx, fs, stateMachines)
	go ListenForDeviceCommandResponses(ctx, fs, ps, stateMachines)
	ListenForTelemetry(ctx, fs, ps, ifClientWriteSites, stateMachines)

}
