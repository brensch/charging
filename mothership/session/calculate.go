package session

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/InfluxCommunity/influxdb3-go/influxdb3"
	"github.com/apache/arrow/go/v13/arrow"
	"github.com/brensch/charging/gen/go/contracts"
)

const (
	fixedPricePerkWh = 0.3
)

func CalculateSession(ctx context.Context, ifClient *influxdb3.Client, sessionID string) (*contracts.Session, error) {

	sessionQuery := fmt.Sprintf(`
		SELECT *
		FROM "sessions"
		WHERE "session_id" = '%s'`, sessionID)

	results, err := ifClient.Query(ctx, sessionQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to query InfluxDB for session start: %v", err)
	}

	var start, finish time.Time
	for results.Next() {
		state, ok := results.Value()["state"].(string)
		if !ok {
			continue
		}

		timeStamp, ok := results.Value()["time"].(arrow.Timestamp)
		if !ok {
			log.Println("Error: time field missing")
			continue
		}

		t := timeStamp.ToTime(arrow.Nanosecond)

		switch state {
		case contracts.SessionEventType_SessionEventType_START.String():
			start = t
		case contracts.SessionEventType_SessionEventType_FINISH.String():
			finish = t
		}
	}

	// TODO: catch panics from malformed data
	plugID := results.Value()["plug_id"].(string)
	siteID := results.Value()["site_id"].(string)
	ownerID := results.Value()["owner"].(string)

	// 2. Query InfluxDB for readings within the session time range
	readingsQuery := fmt.Sprintf(`
		SELECT *
		FROM "plug_readings"
		WHERE time >= '%s' 
		AND time <= '%s'
		AND plug_id == '%s'
		order by time
	`,
		start.Format(time.RFC3339Nano),
		finish.Format(time.RFC3339Nano),
		plugID,
	)

	log.Println(readingsQuery)

	readingsResult, err := ifClient.Query(ctx, readingsQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to query InfluxDB for plug readings: %v", err)
	}

	var totalKWh float64
	var previousTimestamp time.Time // Initialize to track the previous reading's timestamp

	for readingsResult.Next() {
		current := readingsResult.Value()["current"].(float64)
		voltage := readingsResult.Value()["voltage"].(float64)
		// powerFactor := readingsResult.Value()["power_factor"].(float64)
		// power := current * voltage * powerFactor // TODO: decide on power factor accuracy
		power := current * voltage // Power in Watts

		currentTimestamp := readingsResult.Value()["time"].(arrow.Timestamp).ToTime(arrow.Nanosecond)

		if !previousTimestamp.IsZero() {
			duration := currentTimestamp.Sub(previousTimestamp).Seconds() / 3600 // Convert duration from seconds to hours
			kWh := power * duration / 1000                                       // Convert power from Watts to kWh based on the duration
			totalKWh += kWh
		}

		previousTimestamp = currentTimestamp
	}

	return &contracts.Session{
		SessionId: sessionID,
		StartMs:   start.UnixMilli(),
		FinishMs:  finish.UnixMilli(),
		PlugId:    plugID,
		SiteId:    siteID,
		OwnerId:   ownerID,
		TotalKwh:  totalKWh,
		Cents:     int64(totalKWh * fixedPricePerkWh * 100), // TODO: real prices
	}, nil
}
