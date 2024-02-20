package sonoff

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
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

func (s *SonoffPlug) SetState(req contracts.RequestedState) error {
	// desiredState := ConvertToSonoffState(req)
	// log.Println("Setting Sonoff state to", desiredState)

	// apiReq := &APIRequest{
	// 	Action: "update",
	// 	Params: map[string]string{
	// 		"switch": desiredState,
	// 	},
	// }

	// response, err := s.apiCall(apiReq)
	// if err != nil {
	// 	return err
	// }

	// log.Println("Got response from device:", string(response))
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

	fmt.Println("got readings", adjustedCurrent, adjustedVoltage, powerFactor)

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

func (s *SonoffPlug) apiCall(apiReq *APIRequest) ([]byte, error) {
	data, err := json.Marshal(apiReq)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(fmt.Sprintf("http://%s/api/device/%s", s.Host, s.DeviceID), "application/json", bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to make API call")
	}

	return io.ReadAll(resp.Body)
}
