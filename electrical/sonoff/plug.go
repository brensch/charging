package sonoff

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
)

const (
	CurrentUnit = 0.01
	VoltageUnit = 0.01
	PowerUnit   = 0.01
)

// SonoffPlug represents a Sonoff plug with its host and necessary identification.
type SonoffPlug struct {
	Host        string
	DeviceID    string // the spm main
	SubDeviceID string // the 4 port relay
	SocketID    int    // 0-3, the socket number

	mu         sync.Mutex
	siteID     string
	Monitoring MonitoringData
}

func (s *SonoffPlug) ID() string {
	return MakeID(s.DeviceID, s.SubDeviceID, s.SocketID)
}

func (s *SonoffPlug) FuzeID() string {
	return fmt.Sprintf("sonofffuze:%s:%s", s.DeviceID, s.SubDeviceID)
}

func MakeID(deviceID, subDeviceID string, socketID int) string {
	return fmt.Sprintf("sonoff:%s:%s:%d", deviceID, subDeviceID, socketID)
}

func (s *SonoffPlug) SiteID() string {
	return s.siteID
}

// APIRequest represents the structure for an API request to the Sonoff device.
type APIRequest struct {
	// Define the structure based on Sonoff's API requirements
	// This is a placeholder structure
	Action string      `json:"action"`
	Params interface{} `json:"params"`
}

// APIResponse represents a unified response structure for Sonoff device API calls.
type APIResponse struct {
	// Define the structure based on Sonoff's API response
	// This is a placeholder structure
	Status  string      `json:"status"`
	ErrCode int         `json:"err_code"`
	Result  interface{} `json:"result"`
}

func ConvertToSonoffState(state contracts.RequestedState) string {
	switch state {
	case contracts.RequestedState_RequestedState_ON:
		return "on"
	case contracts.RequestedState_RequestedState_OFF:
		return "off"
	default:
		return "off" // Default to off for safety
	}
}

// Switch represents the state of a single switch in the Sonoff device.
type Switch struct {
	Switch string `json:"switch"` // "on" or "off"
	Outlet int    `json:"outlet"`
}

// SonoffRequest represents the payload sent to the Sonoff device to change its state.
type SonoffStateRequest struct {
	DeviceID string `json:"deviceid"`
	Data     struct {
		SubDevId string   `json:"subDevId"`
		Switches []Switch `json:"switches"`
	} `json:"data"`
}

func (s *SonoffPlug) SetState(req contracts.RequestedState) error {

	desiredState := ConvertToSonoffState(req)
	log.Println("Setting Sonoff state to", desiredState)

	payload := SonoffStateRequest{
		DeviceID: s.DeviceID,
		Data: struct {
			SubDevId string   `json:"subDevId"`
			Switches []Switch `json:"switches"`
		}{
			SubDevId: s.SubDeviceID,
			Switches: []Switch{
				{
					Switch: desiredState,
					Outlet: s.SocketID,
				},
			},
		},
	}

	// Marshal the payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Send the request
	resp, err := http.Post(fmt.Sprintf("http://%s:%s/zeroconf/switches", s.Host, SonoffPort), "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	return nil
}

func (s *SonoffPlug) GetReading() (*contracts.Reading, error) {
	s.mu.Lock()
	latestReading := s.Monitoring
	s.mu.Unlock()

	// Adjust current and voltage readings using the given unit constants
	adjustedCurrent := float64(latestReading.Current) * CurrentUnit
	adjustedVoltage := float64(latestReading.Voltage) * VoltageUnit

	// Initialize powerFactor to 0 to avoid dividing by zero
	var powerFactor float64 = 0

	// Check if ApparentPow is not zero to avoid division by zero
	if latestReading.ApparentPow != 0 {
		powerFactor = float64(latestReading.ActPow) / float64(latestReading.ApparentPow)
	}

	reading := &contracts.Reading{
		// State: // TODO: may need an extra api call for this which is annoying
		Current:     adjustedCurrent,
		Voltage:     adjustedVoltage,
		PowerFactor: powerFactor,
		TimestampMs: time.Now().UnixMilli(),

		PlugId: s.ID(),
		FuzeId: s.FuzeID(),
	}

	return reading, nil
}
