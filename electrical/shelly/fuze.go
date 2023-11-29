package shelly

import "fmt"

type ShellyFuze struct {
	Host string
	Mac  string

	siteID string
}

func (s *ShellyFuze) ID() string {
	return fmt.Sprintf("shellyfuze:%s", s.Mac)
}

func (s *ShellyFuze) SiteID() string {
	return s.siteID
}
