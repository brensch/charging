package shelly

import (
	"testing"

	"github.com/brensch/charging/plug"
)

func TestDiscoverDiscoverShellyDevices(t *testing.T) {
	var discoverer plug.Discoverer
	_ = discoverer
	discoverer = &ShellyDiscoverer{}
	discoverer.Discover()

}
