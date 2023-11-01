package plug

type Discoverer interface {
	Discover() ([]Plug, error)
}
