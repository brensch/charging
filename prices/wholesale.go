package prices

type PriceGetter interface {
	GetPrice() float64
}
