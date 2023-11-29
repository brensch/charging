package electrical

import "github.com/brensch/charging/gen/go/contracts"

type Plug interface {
	ID() string
	SiteID() string
	SetState(contracts.PlugStateRequest) error
	GetReading() (*contracts.Reading, error)
}
