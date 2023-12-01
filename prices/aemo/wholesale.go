package aemo

import "math/rand"

type AemoPriceGetter struct {
}

func (p *AemoPriceGetter) GetPrice() float64 {
	return rand.Float64()
}
