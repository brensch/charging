package tasmota

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/brensch/charging/gen/go/contracts"
)

type TasmotaPlug struct {
	plugID  int
	fuzeID  string
	siteID  string
	address string // current IP address of the Tasmota device

	latestReading   *contracts.Reading
	latestReadingMu sync.Mutex
}

func (tp *TasmotaPlug) ID() string {
	return getPlugID(tp.siteID, tp.fuzeID, tp.plugID)
}

func getPlugID(siteID, fuzeID string, plugID int) string {
	return fmt.Sprintf("tasmota:%s:%s:%d", siteID, fuzeID, plugID)
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
		cmd = "On"
	} else {
		cmd = "Off"
	}
	cmd = fmt.Sprintf("Power%d%%20%s", tp.plugID, cmd)

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
	tp.latestReadingMu.Lock()
	defer tp.latestReadingMu.Unlock()
	return tp.latestReading, nil
}
