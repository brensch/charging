package plug

import "github.com/brensch/charging/gen/go/contracts"

type Plug interface {
	SetState(*contracts.PlugLocalStateRequest) (*contracts.PlugLocalStateResult, error)
	GetReading() (*contracts.Reading, error)
	GetConfig() (*contracts.PlugMeta, error)
}
