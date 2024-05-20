package main

import (
	"context"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/brensch/charging/common"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/brensch/charging/mothership/statemachine"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/pubsub"

	// influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/InfluxCommunity/influxdb3-go/influxdb3"

	"google.golang.org/api/option"
)

const (
	keyFile = "./mothership.key"

	influxOrg         = "Niquist"
	influxBucketNEM   = "nem"
	influxBucketSites = "opc"
	influxHost        = "https://us-east-1-1.aws.cloud2.influxdata.com"
)

func main() {

	// Initialize a structured logger
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	logger.Debug("hi")
	logger.Info("initialising")

	ctx, cancel := context.WithCancel(context.Background())

	projectID, _, err := common.ExtractProjectAndClientID(keyFile)
	if err != nil {
		logger.Error("Failed to get identity", "err", err)
		panic("Failed to get identity")
	}

	// Init google pubsub client
	ps, err := pubsub.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		logger.Error("Failed to create client", "err", err)
		panic("Failed to create client")
	}

	// Init InfluxDB client
	influxTokenBytes, err := os.ReadFile("influx.key")
	if err != nil {
		logger.Error("Problem reading influx token", "err", err)
		panic("Problem reading influx token")
	}
	ifClient, err := influxdb3.New(influxdb3.ClientConfig{
		Host:         influxHost,
		Token:        string(influxTokenBytes),
		Organization: influxOrg,
		Database:     influxBucketSites,
	})
	if err != nil {
		logger.Error("problem setting up influxdb client", "err", err)
		panic("problem setting up influxdb client")
	}

	pointsCHAN := make(chan statemachine.PointToAck, 300)

	var flushWG sync.WaitGroup
	flushWG.Add(1)
	go func() {
		defer flushWG.Done()
		points := make([]*influxdb3.Point, 300)
		messages := make([]*pubsub.Message, 300)
		ptr := 0
		countdown := time.NewTimer(10 * time.Second)
		timedOut := false

		for {
			if ctx.Err() != nil {
				log.Println("context error in acking loop")
				return
			}
			select {
			case point := <-pointsCHAN:
				points[ptr] = point.Point
				messages[ptr] = point.Msg
				ptr++
			case <-countdown.C:
				timedOut = true
			case <-ctx.Done():
			}

			if !timedOut && ptr < 300 && ctx.Err() == nil {
				continue
			}

			// if we are doing the flush based on a timeout, reset the counter
			if timedOut {
				countdown.Reset(10 * time.Second)
			}
			timedOut = false

			if ptr == 0 {
				continue
			}

			// first submit all points
			// this should use background context so flush works
			// try this for up to five minutes if we have to. we really don't want this breaking.
			retryCount := 0
			for {
				err := ifClient.WritePoints(context.Background(), points[0:ptr]...)
				if err != nil {
					logger.Error("failed to write points. looping", "error", err)
					retryCount++
					if retryCount > 30 {
						panic("failing to flush to influx. panic! at the disco")
					}
					time.Sleep(10 * time.Second)
					continue
				}
				// we succeeded so can escape
				break
			}

			// if we succeeded though ack all the messages
			for i := 0; i < ptr; i++ {
				messages[i].Ack()
			}
			logger.Info("flushed points", "count", ptr)
			ptr = 0

		}

	}()

	// Init Firestore client
	fs, err := firestore.NewClient(ctx, projectID, option.WithCredentialsFile(keyFile))
	if err != nil {
		logger.Error("Failed to create Firestore client", "err", err)
		panic("Failed to create Firestore client")
	}
	defer fs.Close()

	// this is used to store all the state machines for each plug
	stateMachines := statemachine.InitStateMachineCollection()

	// get all plugstatuses on load and populate the statemachine collection.
	plugStatusQuery := fs.Collection(common.CollectionPlugStatus).Query
	plugStatuses, err := plugStatusQuery.Documents(ctx).GetAll()
	if err != nil {
		logger.Error("couldn't get plug statuses", "err", err)
		panic("couldn't get plug statuses")

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
			stateMachines.AddStateMachine(statemachine.InitPlugStateMachine(ctx, fs, ps, ifClient, pointsCHAN, plugStatus))
		}(plugStatus)

	}

	wg.Wait()

	go ListenForNewDevices(ctx, fs, ps, ifClient, pointsCHAN, stateMachines)
	go ListenForUserRequests(ctx, fs, stateMachines)
	go ListenForDeviceCommandResponses(ctx, fs, ps, stateMachines)
	go ListenForTelemetry(ctx, ps, stateMachines)

	log.Println("listening for cancels")

	// Setup signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan // Block until a signal is received
	cancel()  // Cancel context to stop background routines
	logger.Info("waiting for flush")
	flushWG.Wait()
	ifClient.Close()

	logger.Info("Shutdown complete")
}
