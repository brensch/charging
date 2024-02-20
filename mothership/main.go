package main

import (
	"context"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"google.golang.org/api/option"
)

const (
	keyFile = "./mothership.key"

	secondsToStore = 10
	statesToStore  = 100

	influxOrg         = "Niquist"
	influxBucketNEM   = "nem"
	influxBucketSites = "opc"
	influxHost        = "https://us-east-1-1.aws.cloud2.influxdata.com"
)

func main() {
	// Initialize a structured logger
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))
	logger.Info("initialising", "cool", "story")

	ctx, cancel := context.WithCancel(context.Background())

	projectID, _, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		logger.Error("Failed to get identity", "err", err)
		panic("Failed to get identity") // Halt the program
	}

	// Init google pubsub client
	ps, err := pubsub.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		logger.Error("Failed to create client", "err", err)
		panic("Failed to create client") // Halt the program
	}

	// Init InfluxDB client
	options := influxdb2.DefaultOptions().SetBatchSize(10).SetFlushInterval(10)
	influxTokenBytes, err := os.ReadFile("influx.key")
	if err != nil {
		logger.Error("Problem reading influx token", "err", err)
		panic("Problem reading influx token") // Halt the program
	}
	ifClient := influxdb2.NewClientWithOptions(influxHost, string(influxTokenBytes), options)
	ifClientWriteSites := ifClient.WriteAPI(influxOrg, influxBucketSites)

	// Init Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		logger.Error("Failed to create Firestore client", "err", err)
		panic("Failed to create Firestore client") // Halt the program
	}
	defer fs.Close()

	// this is used to store all the state machines for each plug
	stateMachines := InitStateMachineCollection()

	// get all plugstatuses on load and populate the statemachine collection.
	plugStatusQuery := fs.Collection(common.CollectionPlugStatus).Query
	plugStatuses, err := plugStatusQuery.Documents(ctx).GetAll()
	if err != nil {
		logger.Error("couldn't get plug statuses", "err", err)
		panic("ouldn't get plug statuses") // Halt the program

	}
	var wg sync.WaitGroup
	for _, plugStatusDoc := range plugStatuses {
		var plugStatus *contracts.PlugStatus
		err = plugStatusDoc.DataTo(&plugStatus)
		if err != nil {
			log.Fatal("failed to decode plug status", err)
		}
		wg.Add(1)
		go func(plugStatus *contracts.PlugStatus) {
			defer wg.Done()
			stateMachines.AddStateMachine(InitPlugStateMachine(ctx, fs, ps, ifClientWriteSites, plugStatus.GetSiteId(), plugStatus.GetId()))
		}(plugStatus)

	}

	wg.Wait()

	go ListenForNewDevices(ctx, fs, ps, ifClientWriteSites, stateMachines)
	go ListenForUserRequests(ctx, fs, stateMachines)
	go ListenForDeviceCommandResponses(ctx, fs, ps, stateMachines)
	go ListenForTelemetry(ctx, fs, ps, ifClientWriteSites, stateMachines)

	// Setup signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan // Block until a signal is received
	cancel()  // Cancel context to stop background routines

	logger.Info("Shutting down, flushing InfluxDB data")
	ifClientWriteSites.Flush()
	logger.Info("Shutdown complete")
}
