package demo

import (
	"github.com/brensch/charging/electrical"
)

type Discoverer struct {
	siteName string
}

func InitDiscoverer(siteName string) *Discoverer {
	return &Discoverer{siteName: siteName}
}

func (d *Discoverer) Discover() ([]electrical.Plug, []electrical.Fuze, error) {
	// ips is a map of IP to MAC addresses
	ips := map[string]string{"demo": "mac"}

	var plugs []electrical.Plug
	var fuzes []electrical.Fuze

	// Iterate over the IP addresses in the ips map
	for ip, mac := range ips {
		for i := 0; i < 1; i++ { // Assuming Shelly Pro 4 PM has 4 switches
			plugs = append(plugs, &Plug{
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
