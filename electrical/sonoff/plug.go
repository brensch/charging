package sonoff

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
)

// SonoffPlug represents a Sonoff plug with its host and necessary identification.
type SonoffPlug struct {
	Host     string
	DeviceID string // Unique identifier for the Sonoff device

	siteID string
}

func (s *SonoffPlug) ID() string {
	return fmt.Sprintf("sonoff:%s", s.DeviceID)
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
	desiredState := ConvertToSonoffState(req)
	log.Println("Setting Sonoff state to", desiredState)

	apiReq := &APIRequest{
		Action: "update",
		Params: map[string]string{
			"switch": desiredState,
		},
	}

	response, err := s.apiCall(apiReq)
	if err != nil {
		return err
	}

	log.Println("Got response from device:", string(response))
	return nil
}

func (s *SonoffPlug) GetReading() (*contracts.Reading, error) {
	apiReq := &APIRequest{
		Action: "query",
		// Params could be defined here if needed
	}

	resp, err := s.apiCall(apiReq)
	if err != nil {
		return nil, err
	}

	var response APIResponse
	err = json.Unmarshal(resp, &response)
	if err != nil {
		return nil, err
	}

	// Assuming the response contains the necessary fields directly
	result, ok := response.Result.(map[string]interface{})
	if !ok {
		return nil, errors.New("failed to parse response result")
	}
	_ = result

	// Extract and convert the relevant data from the result
	// Placeholder for actual data conversion
	return &contracts.Reading{
		State: contracts.ActualState_ActualState_ON,
		// Fill in the Reading struct based on the Sonoff response
	}, nil
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
