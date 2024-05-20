package tasmota

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
)

// TasmotaFuze represents a Fuze connected through a Tasmota device.
// There may be future implementations to directly retrieve current measurements from the device.
type TasmotaFuze struct {
	fuzeID  string
	siteID  string
	address string // IP address of the Tasmota device (for potential future use)

	// this is used to update the state of these when it gets it
	plugs []*TasmotaPlug
}

// Define the Status struct according to the Tasmota response format
type Status struct {
	Status struct {
		Topic string `json:"Topic"`
	}
	StatusSNS struct {
		Time string `json:"Time"`
		SPM  struct {
			Energy        []float64 `json:"Energy"`
			ActivePower   []float64 `json:"ActivePower"`
			ApparentPower []float64 `json:"ApparentPower"`
			ReactivePower []float64 `json:"ReactivePower"`
			Voltage       []float64 `json:"Voltage"`
			Current       []float64 `json:"Current"`
		} `json:"SPM"`
	} `json:"StatusSNS"`
}

// NewTasmotaFuze creates a new TasmotaFuze with the specified details.
func NewTasmotaFuze(ctx context.Context, siteID, ip string, status Status) ([]electrical.Plug, electrical.Fuze) {
	fuze := &TasmotaFuze{
		fuzeID:  status.Status.Topic,
		siteID:  siteID,
		address: ip,
	}
	var plugs []electrical.Plug

	numPlugs := len(status.StatusSNS.SPM.Energy)
	for i := 1; i <= numPlugs; i++ {
		plug := &TasmotaPlug{
			plugID:  i,
			fuzeID:  status.Status.Topic,
			siteID:  siteID,
			address: ip,
		}
		plugs = append(plugs, plug)
		fuze.plugs = append(fuze.plugs, plug)
	}

	// poll once synchronously to ensure we have a reading
	fuze.pollDevice()

	go func() {
		fuze.StartPolling(ctx)
	}()

	return plugs, fuze
}

func (tf *TasmotaFuze) StartPolling(ctx context.Context) {

	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				log.Println("exiting polling loop", ctx.Err())
				return
			case <-ticker.C:
				tf.pollDevice()
			}
		}
	}()
}

func (tf *TasmotaFuze) pollDevice() {
	readings, err := tf.getDeviceReadings()
	if err != nil {
		log.Printf("Error polling device at %s: %v\n", tf.address, err)
		return
	}

	if len(readings) != len(tf.plugs) {
		log.Println("wrong length readings")
		return
	}

	for i, plug := range tf.plugs {
		plug.latestReadingMu.Lock()
		plug.latestReading = readings[i]
		plug.latestReadingMu.Unlock()
	}
}

type CombinedStatusResponse struct {
	StatusSNS struct {
		Time string `json:"Time"`
		SPM  struct {
			Energy        []float64 `json:"Energy"`
			ActivePower   []float64 `json:"ActivePower"`
			ApparentPower []float64 `json:"ApparentPower"`
			ReactivePower []float64 `json:"ReactivePower"`
			Voltage       []float64 `json:"Voltage"`
			Current       []float64 `json:"Current"`
		} `json:"SPM"`
	} `json:"StatusSNS"`
	StatusSTS struct {
		Time      string   `json:"Time"`
		Uptime    string   `json:"Uptime"`
		UptimeSec int      `json:"UptimeSec"`
		Power     []string `json:"Power"`
	} `json:"StatusSTS"`
}

func (csr *CombinedStatusResponse) UnmarshalJSON(data []byte) error {
	type Alias CombinedStatusResponse
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(csr),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	var rawMap map[string]json.RawMessage
	if err := json.Unmarshal(data, &rawMap); err != nil {
		return err
	}

	// Handle custom unmarshaling for StatusSTS.Power array based on POWER keys
	stsMap, ok := rawMap["StatusSTS"]
	if !ok {
		return fmt.Errorf("missing StatusSTS key")
	}
	if err := json.Unmarshal(stsMap, &rawMap); err != nil {
		return err
	}

	for i := 1; ; i++ {
		key := fmt.Sprintf("POWER%d", i)
		if val, exists := rawMap[key]; exists {
			var state string
			if err := json.Unmarshal(val, &state); err != nil {
				continue // skip if parsing fails
			}
			csr.StatusSTS.Power = append(csr.StatusSTS.Power, state)
		} else {
			break // stop when no more POWER keys are found
		}
	}

	return nil
}

func (tf *TasmotaFuze) getDeviceReadings() ([]*contracts.Reading, error) {
	combinedStatus, err := tf.getStatusCombined()
	if err != nil {
		log.Printf("Error polling device at %s: %v\n", tf.address, err)
		return nil, err
	}

	readings := make([]*contracts.Reading, len(combinedStatus.StatusSTS.Power))
	for i, powerState := range combinedStatus.StatusSTS.Power {
		if i >= len(combinedStatus.StatusSNS.SPM.Energy) {
			continue // skip if index is out of range for Status 10 data
		}

		powerFactor := 0.0                                      // Default to zero if ApparentPower is zero
		if combinedStatus.StatusSNS.SPM.ApparentPower[i] != 0 { // Check to avoid division by zero
			powerFactor = combinedStatus.StatusSNS.SPM.ReactivePower[i] / combinedStatus.StatusSNS.SPM.ApparentPower[i]
		}

		reading := &contracts.Reading{
			State:       convertPowerStateToActualState(powerState),
			Current:     combinedStatus.StatusSNS.SPM.Current[i],
			Voltage:     combinedStatus.StatusSNS.SPM.Voltage[i],
			PowerFactor: powerFactor,
			TimestampMs: time.Now().UnixNano() / int64(time.Millisecond),
			PlugId:      getPlugID(tf.siteID, tf.ID(), i+1),
			FuzeId:      tf.ID(),
		}
		readings[i] = reading
	}

	return readings, nil
}

func (tf *TasmotaFuze) getStatusCombined() (*CombinedStatusResponse, error) {
	url := fmt.Sprintf("http://%s/cm?cmnd=Status%%200", tf.address) // Update the URL
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var combinedStatus CombinedStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&combinedStatus); err != nil {
		return nil, err
	}
	return &combinedStatus, nil
}

func convertPowerStateToActualState(power string) contracts.ActualState {
	switch power {
	case "ON":
		return contracts.ActualState_ActualState_ON
	case "OFF":
		return contracts.ActualState_ActualState_OFF
	default:
		return contracts.ActualState_ActualState_UNKNOWN
	}
}

// ID returns the FuzeID of the TasmotaFuze.
func (tf *TasmotaFuze) ID() string {
	return tf.fuzeID
}

// SiteID returns the SiteID associated with the TasmotaFuze.
func (tf *TasmotaFuze) SiteID() string {
	return tf.siteID
}
