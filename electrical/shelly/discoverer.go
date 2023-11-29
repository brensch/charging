package shelly

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/brensch/charging/electrical"

	"github.com/hashicorp/mdns"
)

type ShellyDiscoverer struct {
	siteName string
}

func InitShellyDiscoverer(siteName string) *ShellyDiscoverer {
	return &ShellyDiscoverer{siteName: siteName}
}

func findDevices() (map[string]string, error) {
	devices := make(map[string]string)

	entriesCh := make(chan *mdns.ServiceEntry, 10)
	go func() {
		for entry := range entriesCh {
			if strings.HasPrefix(entry.Name, "shelly") && entry.Port == 80 {
				isShelly, mac := isShellyPro4PM(entry.AddrV4.String())
				if isShelly {
					devices[entry.AddrV4.String()] = mac
				}
			}
		}
	}()

	mdns.Lookup("_http._tcp", entriesCh)
	close(entriesCh)

	return devices, nil
}

func (d *ShellyDiscoverer) Discover() ([]electrical.Plug, []electrical.Fuze, error) {
	// ips is a map of IP to MAC addresses
	ips, err := findDevices()
	if err != nil {
		return nil, nil, err
	}

	var plugs []electrical.Plug
	var fuzes []electrical.Fuze

	// Iterate over the IP addresses in the ips map
	for ip, mac := range ips {
		for i := 0; i < 4; i++ { // Assuming Shelly Pro 4 PM has 4 switches
			plugs = append(plugs, &ShellyPlug{
				Host:         ip,
				Mac:          mac,
				SwitchNumber: i,

				siteID: d.siteName,
			})
		}
		fuzes = append(fuzes, &ShellyFuze{
			Host: ip,
			Mac:  mac,

			siteID: d.siteName,
		})
	}

	return plugs, fuzes, nil
}

type ShellyStatus struct {
	Mac string `json:"mac"`
	// You can add other fields if required
}

func isShellyPro4PM(host string) (bool, string) {
	resp, err := http.Get(fmt.Sprintf("http://%s/rpc/sys.getstatus", host))
	if err != nil {
		log.Println("Error while checking Shelly device:", err)
		return false, ""
	}
	defer resp.Body.Close()

	var status ShellyStatus
	err = json.NewDecoder(resp.Body).Decode(&status)
	if err != nil {
		log.Println("Error decoding Shelly status:", err)
		return false, ""
	}

	// Assuming the MAC address being present is enough to verify the device as a ShellyPro4PM
	if status.Mac != "" {
		return true, status.Mac
	}

	return false, ""
}
