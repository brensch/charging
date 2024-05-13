package tasmota

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"

	"github.com/brensch/charging/electrical"
)

type TasmotaDiscoverer struct {
	siteID string
}

func InitTasmotaDiscoverer(siteID string) *TasmotaDiscoverer {
	return &TasmotaDiscoverer{siteID: siteID}
}

// this function breaks this being a pure go implementation but fine as an interim
func scanNetwork() ([]string, error) {
	cmd := exec.Command("sudo", "arp-scan", "-l") // '-l' scans the local network
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	return parseARPScanOutput(string(output)), nil
}

func parseARPScanOutput(output string) []string {
	var ips []string
	scanner := bufio.NewScanner(strings.NewReader(output))
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "Interface:") {
			continue
		}
		parts := strings.Fields(line)
		if len(parts) > 1 {
			ip := parts[0]
			ips = append(ips, ip)
		}
	}
	return ips
}

func (d *TasmotaDiscoverer) Discover(ctx context.Context) ([]electrical.Plug, []electrical.Fuze, error) {
	ips, err := scanNetwork()
	if err != nil {
		return nil, nil, err
	}

	var plugs []electrical.Plug
	var fuzes []electrical.Fuze

	for _, ip := range ips {
		if isTasmota, _ := checkTasmotaDevice(ip); isTasmota {
			plugs = append(plugs, &TasmotaPlug{
				plugID:  ip,
				siteID:  d.siteID,
				address: ip,
			})
			// Assuming each Tasmota device can also represent a Fuze
			fuzes = append(fuzes, &TasmotaFuze{
				fuzeID:  ip,
				siteID:  d.siteID,
				address: ip,
			})
		}
	}

	return plugs, fuzes, nil
}

func checkTasmotaDevice(ip string) (bool, string) {
	resp, err := http.Get(fmt.Sprintf("http://%s/cm?cmnd=Status 0", ip))
	if err != nil {
		log.Println("Error while checking Tasmota device:", err)
		return false, ""
	}
	defer resp.Body.Close()

	var status struct {
		Status struct {
			DeviceName string `json:"DeviceName"`
		} `json:"Status"`
	}
	err = json.NewDecoder(resp.Body).Decode(&status)
	if err != nil {
		log.Println("Error decoding Tasmota status:", err)
		return false, ""
	}

	// Assume if a device name is received, it's a Tasmota device
	if status.Status.DeviceName != "" {
		return true, ip
	}

	return false, ""
}
