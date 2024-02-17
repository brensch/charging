package sonoff

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"

	"github.com/brensch/charging/electrical"
	"github.com/hashicorp/mdns"
)

const (
	eWePrefix  = "eWeLink_"
	SonoffPort = "8081" // this seems to be static
)

type SonoffDiscoverer struct {
	siteName string
}

func InitSonoffDiscoverer(siteName string) *SonoffDiscoverer {
	return &SonoffDiscoverer{siteName: siteName}
}

func findDevices() (map[string]string, error) {
	devices := make(map[string]string)

	entriesCh := make(chan *mdns.ServiceEntry, 10)
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for entry := range entriesCh {
			if !strings.HasPrefix(entry.Name, eWePrefix) {
				continue
			}
			spmMainID := strings.ReplaceAll(entry.Name, eWePrefix, "")
			spmMainID = strings.ReplaceAll(spmMainID, "._ewelink._tcp.local.", "")
			devices[entry.Addr.String()] = spmMainID

		}
	}()

	mdns.Lookup("_ewelink._tcp", entriesCh)
	close(entriesCh)
	wg.Wait()

	return devices, nil
}

// RequestBody represents the JSON payload for the request.
type RequestBody struct {
	DeviceID string      `json:"deviceid"`
	Data     interface{} `json:"data"`
}

// ResponseBody represents the JSON structure of the response from the server.
type ResponseBody struct {
	Seq   int `json:"seq"`
	Error int `json:"error"`
	Data  struct {
		SubDevList []struct {
			SubDevId string `json:"subDevId"`
			Type     int    `json:"type"`
		} `json:"subDevList"`
	} `json:"data"`
}

func FetchSubDeviceList(ip, deviceID string) (*ResponseBody, error) {
	// Construct the URL from the IP and port
	url := fmt.Sprintf("http://%s:%s/zeroconf/subDevList", ip, SonoffPort)

	// Create the request body
	requestBody := RequestBody{
		DeviceID: deviceID,
		Data:     struct{}{}, // Empty object as specified
	}

	// Marshal the request body to JSON
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	fmt.Println(string(jsonData))

	// Create a new POST request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	// Set the Content-Type header
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	fmt.Println("response", string(body))

	// Unmarshal the response body into the ResponseBody struct
	var responseBody ResponseBody
	err = json.Unmarshal(body, &responseBody)
	if err != nil {
		return nil, err
	}

	return &responseBody, nil
}

func (d *SonoffDiscoverer) Discover() ([]electrical.Plug, []electrical.Fuze, error) {
	// ips is a map of IP to MAC addresses
	ips, err := findDevices()
	if err != nil {
		return nil, nil, err
	}

	localIP, err := getLocalIP()
	if err != nil {
		return nil, nil, err
	}

	var plugs []electrical.Plug
	var fuzes []electrical.Fuze

	plugMap := make(map[string]*SonoffPlug)
	go startMonitorListener(plugMap)

	// Iterate over the IP addresses in the ips map
	for ip, id := range ips {
		fmt.Println("looking up subdevices of device", id, ip)
		// get the subdevicelist for the spm main
		subDeviceList, err := FetchSubDeviceList(ip, id)
		if err != nil {
			return nil, nil, err
		}
		for _, subDevice := range subDeviceList.Data.SubDevList {
			fmt.Println("found subdevice", subDevice.SubDevId, subDevice.Type)

			for i := 0; i < 4; i++ { // Assuming Shelly Pro 4 PM has 4 switches
				plug := &SonoffPlug{
					Host:        ip,
					DeviceID:    id,
					SubDeviceID: subDevice.SubDevId,
					SocketID:    i,

					siteID: d.siteName,
				}

				plugMap[fmt.Sprintf("%s-%d", plug.SubDeviceID, i)] = plug

				err = plug.requestDeviceToSendTelemetry(localIP)
				if err != nil {
					return nil, nil, err
				}

				plugs = append(plugs, plug)
			}
			fuzes = append(fuzes, &SonoffFuze{
				Host:        ip,
				DeviceID:    id,
				SubDeviceID: subDevice.SubDevId,

				siteID: d.siteName,
			})
		}
	}

	// initialise listener for live updates

	return plugs, fuzes, nil
}

func getLocalIP() (string, error) {
	addresses, err := net.InterfaceAddrs()
	if err != nil {
		return "", err
	}
	for _, address := range addresses {
		// Check if the address type is IPNet and is not a loopback address
		if ipNet, ok := address.(*net.IPNet); ok && !ipNet.IP.IsLoopback() {
			if ipNet.IP.To4() != nil {
				return ipNet.IP.String(), nil
			}
		}
	}
	return "", fmt.Errorf("unable to find local IP address")
}

func (p *SonoffPlug) requestDeviceToSendTelemetry(localIP string) error {
	fmt.Println("requesting socket send telemetry", p.DeviceID, p.SubDeviceID, p.SocketID)
	url := fmt.Sprintf("http://%s:%s/zeroconf/monitor", p.Host, SonoffPort)
	updatePayload := MonitorUpdateRequest{
		DeviceID: p.DeviceID, // Use the SubDevId of the device as DeviceID
		Data: struct {
			URL      string `json:"url"`
			Port     int    `json:"port"`
			SubDevId string `json:"subDevId"`
			Outlet   int    `json:"outlet"`
			Time     int    `json:"time"`
		}{
			URL:      fmt.Sprintf("http://%s", localIP), // Update with your actual URL
			Port:     7790,                              // Update with your actual listening port
			SubDevId: p.SubDeviceID,
			Outlet:   p.SocketID, // Assuming Outlet is related to Type
			Time:     3600,       // Update with your actual time
		},
	}

	requestBody, err := json.Marshal(updatePayload)
	if err != nil {
		log.Printf("Error marshaling update request: %v", err)
		return err
	}
	fmt.Println(url, string(requestBody))

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		log.Printf("Error sending update to device: %v", err)
		return err
	}
	defer resp.Body.Close()
	fmt.Println("finished yo")

	if resp.StatusCode != 200 {
		return fmt.Errorf("got non 200 status code: %d", resp.StatusCode)
	}

	return nil
}

func startMonitorListener(plugs map[string]*SonoffPlug) {
	http.HandleFunc("/update", func(w http.ResponseWriter, r *http.Request) {
		var update MonitoringData
		err := json.NewDecoder(r.Body).Decode(&update)
		if err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		// devicesMu.Lock()
		// defer devicesMu.Unlock()
		plugID := fmt.Sprintf("%s-%d", update.SubDevId, update.Outlet)

		if plug, ok := plugs[plugID]; ok {
			// Update the internal state of the plug
			plug.Monitoring = update

		}

		fmt.Fprintf(w, "Update received")
	})

	log.Fatal(http.ListenAndServe(":7790", nil)) // Listen on an arbitrary port
}

type MonitorUpdateRequest struct {
	DeviceID string `json:"deviceid"`
	Data     struct {
		URL      string `json:"url"`
		Port     int    `json:"port"`
		SubDevId string `json:"subDevId"`
		Outlet   int    `json:"outlet"`
		Time     int    `json:"time"`
	} `json:"data"`
}

type MonitoringData struct {
	SubDevId    string `json:"subDevId"`
	Outlet      int    `json:"outlet"`
	Current     int    `json:"current"`
	Voltage     int    `json:"voltage"`
	ActPow      int    `json:"actPow"`
	ReactPow    int    `json:"reactPow"`
	ApparentPow int    `json:"apparentPow"`
}
