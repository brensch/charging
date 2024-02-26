package session

import (
	"context"
	"fmt"

	influxdb2api "github.com/influxdata/influxdb-client-go/v2/api"
)

func CalculateSession(ctx context.Context, ifdb influxdb2api.QueryAPI, sessionID string) error {
	// 1. Query InfluxDB for session start and end times
	startQuery := fmt.Sprintf(`
		FROM "sessions"
		WHERE "session_id" = '%s' AND "state" = 'START'
	`, sessionID)
	endQuery := fmt.Sprintf(`
		FROM "sessions"
		WHERE "session_id" = '%s' AND "state" = 'FINISH'
	`, sessionID)

	startResult, err := ifdb.Query(ctx, startQuery)
	if err != nil {
		return fmt.Errorf("failed to query InfluxDB for session start: %v", err)
	}
	var startTime int64
	for startResult.Next() {
		startTime = startResult.Record().Time().UnixMilli()
	}

	endResult, err := ifdb.Query(ctx, endQuery)
	if err != nil {
		return fmt.Errorf("failed to query InfluxDB for session end: %v", err)
	}
	var endTime int64
	for endResult.Next() {
		endTime = endResult.Record().Time().UnixMilli()
	}

	if startResult.Err() != nil {
		return fmt.Errorf("error processing start query results: %v", startResult.Err())
	}
	if endResult.Err() != nil {
		return fmt.Errorf("error processing end query results: %v", endResult.Err())
	}

	// 2. Query InfluxDB for readings within the session time range
	readingsQuery := fmt.Sprintf(`
		FROM "plug_readings"
		WHERE "session_id" = '%s'
		AND time >= %dms AND time <= %dms
	`, sessionID, startTime, endTime)

	readingsResult, err := ifdb.Query(ctx, readingsQuery)
	if err != nil {
		return fmt.Errorf("failed to query InfluxDB for plug readings: %v", err)
	}

	// 3. Calculate total kWh consumed
	totalKWh := 0.0
	for readingsResult.Next() {
		// Assuming power is calculated as (current * voltage * power_factor)
		current := readingsResult.Record().ValueByKey("current").(float64)
		voltage := readingsResult.Record().ValueByKey("voltage").(float64)
		powerFactor := readingsResult.Record().ValueByKey("power_factor").(float64)
		power := current * voltage * powerFactor

		// Assuming readings are 1 minute apart. Adjust as necessary.
		totalKWh += power * (1.0 / 60.0) / 1000.0 // Convert W to kW and add to total
	}
	if readingsResult.Err() != nil {
		return fmt.Errorf("error processing readings query results: %v", readingsResult.Err())
	}

	fmt.Printf("Total kWh consumed in session %s: %f\n", sessionID, totalKWh)
	return nil
}
