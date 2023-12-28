package electrical

type Discoverer interface {
	Discover() ([]Plug, []Fuze, error)
}

type IDer interface {
	ID() string
	SiteID() string
}
