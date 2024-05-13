package tasmota

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/brensch/charging/gen/go/contracts"
)

type TasmotaPlug struct {
	plugID  string
	fuzeID  string
	siteID  string
	address string // IP address of the Tasmota device
}

func (tp *TasmotaPlug) ID() string {
	return tp.plugID
}

func (tp *TasmotaPlug) FuzeID() string {
	return tp.fuzeID
}

func (tp *TasmotaPlug) SiteID() string {
	return tp.siteID
}

func (tp *TasmotaPlug) SetState(requestedState contracts.RequestedState) error {
	var cmd string
	if requestedState == contracts.RequestedState_RequestedState_ON {
		cmd = "Power%20On"
	} else {
		cmd = "Power%20Off"
	}

	url := fmt.Sprintf("http://%s/cm?cmnd=%s", tp.address, cmd)
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to set state, HTTP status code: %d", resp.StatusCode)
	}
	return nil
}

func (tp *TasmotaPlug) GetReading() (*contracts.Reading, error) {
	url := fmt.Sprintf("http://%s/cm?cmnd=Status%208", tp.address)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var reading contracts.Reading
	err = json.Unmarshal(body, &reading)
	if err != nil {
		return nil, err
	}

	return &reading, nil
}
