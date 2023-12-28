package shelly

import (
	"testing"

	"github.com/brensch/charging/electrical"
)

func TestDiscoverDiscoverShellyDevices(t *testing.T) {
	var discoverer electrical.Discoverer
	_ = discoverer
	discoverer = &ShellyDiscoverer{}
	discoverer.Discover()

}
