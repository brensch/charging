package sonoff

import "fmt"

type SonoffFuze struct {
	Host        string
	DeviceID    string
	SubDeviceID string

	siteID string
}

func (f *SonoffFuze) ID() string {
	return fmt.Sprintf("sonofffuze:%s-%s", f.DeviceID, f.SubDeviceID)
}

func (f *SonoffFuze) SiteID() string {
	return f.siteID
}
