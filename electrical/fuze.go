package electrical

// TODO: there may be a way to get current directly from shelly
type Fuze interface {
	ID() string
	SiteID() string
}
