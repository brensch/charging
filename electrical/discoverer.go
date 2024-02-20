package electrical

import "context"

type Discoverer interface {
	Discover(context.Context) ([]Plug, []Fuze, error)
}

type IDer interface {
	ID() string
	SiteID() string
}
