package tasmota

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"time"

	"github.com/brensch/charging/electrical"
)

type TasmotaDiscoverer struct {
	siteID string
}

func InitTasmotaDiscoverer(siteID string) *TasmotaDiscoverer {
	return &TasmotaDiscoverer{siteID: siteID}
}

func scanNetwork() ([]string, error) {
	cmd := exec.Command("sudo", "arp-scan", "-l")
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
		isTasmota, status := checkTasmotaDevice(ip)
		if !isTasmota {
			continue
		}
		newPlugs, newFuze := NewTasmotaFuze(ctx, d.siteID, ip, status)
		plugs = append(plugs, newPlugs...)
		fuzes = append(fuzes, newFuze)
	}

	return plugs, fuzes, nil
}

func checkTasmotaDevice(ip string) (bool, Status) {
	log.Printf("checking %s", ip)
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Get(fmt.Sprintf("http://%s/cm?cmnd=Status%%200", ip))
	if err != nil {
		log.Printf("not a tasmota device, failed get: %s [%s]", ip, err)
		return false, Status{}
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("not a tasmota device, failed readall: %s [%s]", ip, err)
		return false, Status{}
	}

	var status Status // Define Status struct to decode the JSON response into
	err = json.Unmarshal(bodyBytes, &status)
	if err != nil {
		log.Printf("not a tasmota device, failed decode: %s [%s]", ip, err)
		return false, Status{}
	}

	// Check for a valid response structure to confirm it's a Tasmota device
	if len(status.StatusSNS.SPM.Energy) > 0 {
		log.Printf("found a tasmota device: %s", ip)
		return true, status
	}
	log.Printf("not a tasmota device, no energy: %s [%s]", ip, string(bodyBytes))

	return false, Status{}
}
