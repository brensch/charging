package shelly

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/brensch/charging/gen/go/contracts"
)

// ShellyPlug represents a Shelly plug with its host and switch number.
type ShellyPlug struct {
	Host         string
	Mac          string
	SwitchNumber int
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

func ConvertToPlugState(wasOn bool) contracts.ElectricalState {
	if wasOn {
		return contracts.ElectricalState_PlugState_ON
	}
	return contracts.ElectricalState_PlugState_OFF
}

func ConvertToShellyState(state contracts.PlugStateRequest) (bool, error) {
	switch state {
	case contracts.PlugStateRequest_PlugStateRequest_ON:
		return true, nil
	case contracts.PlugStateRequest_PlugStateRequest_OFF:
		return false, nil
	default:
		return false, errors.New("unknown plug state request")
	}
}

type SetStateResult struct {
	WasOn bool `json:"was_on"`
}

type SwitchSetParams struct {
	ID    int  `json:"id"`
	State bool `json:"state"`
}

func (s *ShellyPlug) SetState(req *contracts.PlugLocalStateRequest) (*contracts.PlugLocalStateResult, error) {
	state, err := ConvertToShellyState(req.GetRequestedState())
	if err != nil {
		return nil, err
	}

	rpcReq := &RpcRequest{
		ID:     0,
		Method: "switch.set",
		Params: &SwitchSetParams{
			ID:    s.SwitchNumber,
			State: state,
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

	var stateResult SetStateResult
	jsonData, err := json.Marshal(result)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(jsonData, &stateResult)
	if err != nil {
		return nil, err
	}

	// the previous state doesn't matter. we just return the requested state
	plugState := ConvertToPlugState(state)
	return &contracts.PlugLocalStateResult{
		CurrentState: plugState,
	}, nil
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

	return ConvertToReading(statusResult), nil
}

func ConvertToReading(statusResult GetStatusResult) *contracts.Reading {
	state := ConvertToPlugState(statusResult.Output)
	return &contracts.Reading{
		State:       state,
		Current:     statusResult.Current,
		Voltage:     statusResult.Voltage,
		PowerFactor: statusResult.Pf,
		Timestamp:   statusResult.AEnergy.MinuteTs,
		Energy:      statusResult.AEnergy.Total,
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

type SwitchGetConfigParams struct {
	ID int `json:"id"`
}

type GetConfigResult struct {
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

func (s *ShellyPlug) GetConfig() (*contracts.PlugMeta, error) {
	rpcReq := &RpcRequest{
		ID:     0,
		Method: "switch.getconfig",
		Params: &SwitchGetConfigParams{
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

	var structuredResult GetConfigResult
	jsonData, err := json.Marshal(result)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(jsonData, &structuredResult)
	if err != nil {
		return nil, err
	}

	return ConvertToConfig(structuredResult), nil
}

func ConvertToConfig(statusResult GetConfigResult) *contracts.PlugMeta {
	// TODO: actually convert
	return &contracts.PlugMeta{
		Type: contracts.PlugType_PlugType_SHELLY,
	}
}
