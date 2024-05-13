package tasmota

// TasmotaFuze represents a Fuze connected through a Tasmota device.
// There may be future implementations to directly retrieve current measurements from the device.
type TasmotaFuze struct {
	fuzeID  string
	siteID  string
	address string // IP address of the Tasmota device (for potential future use)
}

// NewTasmotaFuze creates a new TasmotaFuze with the specified details.
func NewTasmotaFuze(fuzeID, siteID, address string) *TasmotaFuze {
	return &TasmotaFuze{
		fuzeID:  fuzeID,
		siteID:  siteID,
		address: address,
	}
}

// ID returns the FuzeID of the TasmotaFuze.
func (sf *TasmotaFuze) ID() string {
	return sf.fuzeID
}

// SiteID returns the SiteID associated with the TasmotaFuze.
func (sf *TasmotaFuze) SiteID() string {
	return sf.siteID
}
