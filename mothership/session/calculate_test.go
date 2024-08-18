package session

import (
	"context"
	"os"
	"testing"

	"github.com/InfluxCommunity/influxdb3-go/influxdb3"
)

const (
	influxOrg         = "Niquist"
	influxBucketNEM   = "nem"
	influxBucketSites = "opc"
	influxHost        = "https://us-east-1-1.aws.cloud2.influxdata.com"
)

func TestCalculateSession(t *testing.T) {
	influxTokenBytes, err := os.ReadFile("../../influx.key")
	if err != nil {
		t.Log(err)
		t.FailNow()
	}
	ifClient, err := influxdb3.New(influxdb3.ClientConfig{
		Host:         influxHost,
		Token:        string(influxTokenBytes),
		Organization: influxOrg,
		Database:     influxBucketSites,
	})
	if err != nil {
		t.Log(err)
		t.FailNow()
	}

	ctx := context.Background()
	session, err := CalculateSession(ctx, ifClient, "6a05402a-46c0-498a-99a3-7ca972b51303")
	if err != nil {
		t.Error(err)
	}

	t.Log(session)

}
