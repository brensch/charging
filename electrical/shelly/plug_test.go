package shelly

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
	"github.com/stretchr/testify/assert"
)

func TestSetState(t *testing.T) {
	tests := []struct {
		requestedState contracts.RequestedState
		mockResponse   string
		expectedState  contracts.ActualState
		expectedErr    bool
	}{
		{
			requestedState: contracts.RequestedState_RequestedState_ON,
			mockResponse:   `{"id": 0, "src": "test", "result": {"was_on": false}}`,
			expectedState:  contracts.ActualState_ActualState_ON,
			expectedErr:    false,
		},
		{
			requestedState: contracts.RequestedState_RequestedState_ON,
			mockResponse:   `{"id": 0, "src": "test", "result": {"was_on": true}}`,
			expectedState:  contracts.ActualState_ActualState_OFF,
			expectedErr:    false,
		},
		{
			requestedState: contracts.RequestedState_RequestedState_OFF,
			mockResponse:   `{"id": 0, "src": "test", "result": {"was_on": true}}`,
			expectedState:  contracts.ActualState_ActualState_OFF,
			expectedErr:    false,
		},
	}

	for _, tt := range tests {
		server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			fmt.Fprint(rw, tt.mockResponse)
		}))

		defer server.Close()

		plug := &ShellyPlug{
			Host:         server.URL[7:], // Remove the "http://" part
			SwitchNumber: 0,
		}

		err := plug.SetState(tt.requestedState)
		assert.Equal(t, tt.expectedErr, err != nil)

	}
}

func TestGetReading(t *testing.T) {
	tests := []struct {
		mockResponse string
		expected     *contracts.Reading
		expectedErr  bool
	}{
		{
			mockResponse: `{"id": 2, "src": "test", "result": {"id": 0, "output": true, "apower": 10, "voltage": 220, "freq": 50, "current": 5, "pf": 0.9, "aenergy": {"total": 100, "by_minute": [10, 20], "minute_ts": 1629300000}, "temperature": {"tC": 25, "tF": 77}}}`,
			expected: &contracts.Reading{
				State:       contracts.ActualState_ActualState_ON,
				Current:     5,
				Voltage:     220,
				PowerFactor: 0.9,
				TimestampMs: 1629300000,
			},
			expectedErr: false,
		},
		// Add more test cases as needed
	}

	for _, tt := range tests {
		server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			fmt.Fprint(rw, tt.mockResponse)
		}))

		defer server.Close()

		plug := &ShellyPlug{
			Host:         server.URL[7:], // Remove the "http://" part
			SwitchNumber: 0,
		}

		result, err := plug.GetReading()
		assert.Equal(t, tt.expectedErr, err != nil)

		if err == nil {
			assert.Equal(t, tt.expected, result)
		}
	}
}

func TestShellyPlugInterface(t *testing.T) {
	var plug electrical.Plug
	_ = plug
	plug = &ShellyPlug{}
}
