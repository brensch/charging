package demo

import (
	"context"
	"testing"

	"github.com/brensch/charging/electrical"
)

func TestDiscoverDiscoverShellyDevices(t *testing.T) {
	var discoverer electrical.Discoverer
	_ = discoverer
	discoverer = &Discoverer{}
	discoverer.Discover(context.Background())

}
