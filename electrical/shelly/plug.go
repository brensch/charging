package shelly

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

// ShellyPlug represents a Shelly plug with its host and switch number.
type ShellyPlug struct {
	Host         string
	Mac          string
	SwitchNumber int

	siteID string
}

func (s *ShellyPlug) ID() string {
	return fmt.Sprintf("shelly:%s:%d", s.Mac, s.SwitchNumber)
}

func (s *ShellyPlug) FuzeID() string {
	return fmt.Sprintf("shellyfuze:%s", s.Mac)
}

func (s *ShellyPlug) SiteID() string {
	return s.siteID
}

// RpcRequest represents the structure for an RPC request to the Shelly plug.
type RpcRequest struct {
	ID     int         `json:"id"`
	Method string      `json:"method"`
	Params interface{} `json:"params"`
}

// RpcResponse represents a unified response structure for Shelly plug RPC calls.
type RpcResponse struct {
	ID     int         `json:"id"`
	Src    string      `json:"src"`
	Result interface{} `json:"result"`
}

func ConvertToPlugState(wasOn bool) contracts.ActualState {
	if wasOn {
		return contracts.ActualState_ActualState_ON
	}
	return contracts.ActualState_ActualState_OFF
}

func ConvertToShellyState(state contracts.RequestedState) bool {
	switch state {
	case contracts.RequestedState_RequestedState_ON:
		return true
	case contracts.RequestedState_RequestedState_OFF:
		return false
	default:
		return false
	}
}

type SetStateResult struct {
	WasOn bool `json:"was_on"`
}

type SwitchSetParams struct {
	ID int  `json:"id"`
	On bool `json:"on"`
}

func (s *ShellyPlug) SetState(req contracts.RequestedState) error {
	state := ConvertToShellyState(req)
	log.Println("setting shelly state to", state)

	rpcReq := &RpcRequest{
		ID:     0,
		Method: "switch.set",
		Params: &SwitchSetParams{
			ID: s.SwitchNumber,
			On: state,
		},
	}

	response, err := s.rpcCall(rpcReq)
	if err != nil {
		return err
	}

	log.Println("got response from device:", string(response))

	return nil

	// Shelly only returns WasOn in its response so don't need to check the payload
	// var response RpcResponse
	// err = json.Unmarshal(resp, &response)
	// if err != nil {
	// 	return err
	// }

	// result, ok := response.Result.(map[string]interface{})
	// if !ok {
	// 	return errors.New("failed to parse response result")
	// }

	// var stateResult SetStateResult
	// jsonData, err := json.Marshal(result)
	// if err != nil {
	// 	return err
	// }
	// err = json.Unmarshal(jsonData, &stateResult)
	// if err != nil {
	// 	return err
	// }

}

type SwitchGetStatusParams struct {
	ID int `json:"id"`
}

type GetStatusResult struct {
	ID      int           `json:"id"`
	Output  bool          `json:"output"`
	APower  float64       `json:"apower"`
	Voltage float64       `json:"voltage"`
	Freq    float64       `json:"freq"`
	Current float64       `json:"current"`
	Pf      float64       `json:"pf"`
	AEnergy ShellyAEnergy `json:"aenergy"`
	Temp    ShellyTemp    `json:"temperature"`
}

type ShellyAEnergy struct {
	Total    float64   `json:"total"`
	ByMinute []float64 `json:"by_minute"`
	MinuteTs int64     `json:"minute_ts"`
}

type ShellyTemp struct {
	TC float64 `json:"tC"`
	TF float64 `json:"tF"`
}

func (s *ShellyPlug) GetReading() (*contracts.Reading, error) {
	rpcReq := &RpcRequest{
		ID:     0,
		Method: "switch.getstatus",
		Params: &SwitchGetStatusParams{
			ID: s.SwitchNumber,
		},
	}

	resp, err := s.rpcCall(rpcReq)
	if err != nil {
		return nil, err
	}

	var response RpcResponse
	err = json.Unmarshal(resp, &response)
	if err != nil {
		return nil, err
	}

	result, ok := response.Result.(map[string]interface{})
	if !ok {
		return nil, errors.New("failed to parse response result")
	}

	var statusResult GetStatusResult
	jsonData, err := json.Marshal(result)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(jsonData, &statusResult)
	if err != nil {
		return nil, err
	}

	return ConvertToReading(statusResult, s.ID(), s.FuzeID()), nil
}

func ConvertToReading(statusResult GetStatusResult, plugID, fuzeID string) *contracts.Reading {
	state := ConvertToPlugState(statusResult.Output)
	return &contracts.Reading{
		TimestampMs: time.Now().UnixMilli(),
		State:       state,
		Current:     statusResult.Current,
		Voltage:     statusResult.Voltage,
		PowerFactor: statusResult.Pf,

		PlugId: plugID,
		FuzeId: fuzeID,
	}
}

func (s *ShellyPlug) rpcCall(rpcReq *RpcRequest) ([]byte, error) {
	data, err := json.Marshal(rpcReq)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(fmt.Sprintf("http://%s/rpc", s.Host), "application/json", bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to make RPC call")
	}

	return io.ReadAll(resp.Body)
}
