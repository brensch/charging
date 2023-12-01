package electrical

import "github.com/brensch/charging/gen/go/contracts"

type Plug interface {
	ID() string
	SiteID() string
	SetState(contracts.RequestedState) error
	GetReading() (*contracts.Reading, error)
}
