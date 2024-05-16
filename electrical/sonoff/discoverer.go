package sonoff

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

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

	log.Println("response", string(body))

	// Unmarshal the response body into the ResponseBody struct
	var responseBody ResponseBody
	err = json.Unmarshal(body, &responseBody)
	if err != nil {
		return nil, err
	}

	return &responseBody, nil
}

func (d *SonoffDiscoverer) Discover(ctx context.Context) ([]electrical.Plug, []electrical.Fuze, error) {
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

	// Iterate over the IP addresses in the ips map
	for ip, id := range ips {
		log.Println("looking up subdevices of device", id, ip)
		// get the subdevicelist for the spm main
		subDeviceList, err := FetchSubDeviceList(ip, id)
		if err != nil {
			return nil, nil, err
		}
		for _, subDevice := range subDeviceList.Data.SubDevList {
			log.Println("found subdevice", subDevice.SubDevId, subDevice.Type)

			for i := 0; i < 4; i++ { // Assuming Shelly Pro 4 PM has 4 switches
				plug := &SonoffPlug{
					Host:        ip,
					DeviceID:    id,
					SubDeviceID: subDevice.SubDevId,
					SocketID:    i,

					siteID: d.siteName,
				}

				plugMap[fmt.Sprintf("%s-%d", plug.SubDeviceID, i)] = plug
				// there is a fundamental flaw in the sonoff
				// the only way to retrieve the telemetry in realtime is to
				// have it send it to you. you give it a target url and it uploads it.
				// only catch is it doesn't actually update at the frequency that it says
				// https://sonoff.tech/sonoff-diy-developer-documentation-spm-main-http-api/#9

				// as per their docs:
				// Reporting conditions:
				// -The current change exceeds 0.03 A.
				// -The voltage change exceeds 5 V.
				// -The active power, reactive power, or apparent power change exceeds 2 W.

				// but in practice this is not happening.
				// TODO: explore why this is.

				// Workaround is that every time you ping update the device it uploads its current state.
				// There's also a bug that it only seems to support one socket per port, so doing one port per socket.
				port := GeneratePort(plug.SubDeviceID, fmt.Sprint(plug.SocketID))

				go startMonitorListener(port, plug)

				// start a loop to request monitoring
				// This is a bit dirty but fine for the time being
				go func(plug *SonoffPlug) {
					ticker := time.NewTicker(5 * time.Second)
					for {
						err = plug.requestDeviceToSendTelemetry(localIP, port)
						if err != nil {
							log.Fatalf("failed to request device send telemetry")
						}
						select {
						case <-ctx.Done():
							return
						case <-ticker.C:
						}
					}
				}(plug)

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

func (p *SonoffPlug) requestDeviceToSendTelemetry(localIP string, port int) error {
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
			Port:     port,                              // Update with your actual listening port
			SubDevId: p.SubDeviceID,
			Outlet:   p.SocketID, // Assuming Outlet is related to Type
			Time:     180,        // Update with your actual time
		},
	}

	requestBody, err := json.Marshal(updatePayload)
	if err != nil {
		log.Printf("Error marshaling update request: %v", err)
		return err
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		log.Printf("Error sending update to device: %v", err)
		return err
	}
	defer resp.Body.Close()

	_, err = io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading body on monitor request: %v", err)
		return err
	}

	if resp.StatusCode != 200 {
		return fmt.Errorf("got non 200 status code: %d", resp.StatusCode)
	}

	return nil
}

func GeneratePort(s1, s2 string) int {
	// Concatenate the strings and compute SHA-1 hash
	hash := sha1.New()
	hash.Write([]byte(s1 + s2))
	bs := hash.Sum(nil)

	// Convert the first few bytes of the hash to an integer
	// Using only a portion of the hash to get a smaller number
	hashInt := binary.BigEndian.Uint32(bs[:4])

	// Map the hash integer to a valid port range (1024-49151)
	// The range size is 49151 - 1024 = 48127
	port := 1024 + (hashInt % 48127)

	return int(port)
}

// note, for some reason the responses from the sonoff only work if i listen like this
func startMonitorListener(port int, plug *SonoffPlug) {
	listenAddr := fmt.Sprintf("0.0.0.0:%d", port) // Listen on all interfaces
	listener, err := net.Listen("tcp", listenAddr)
	if err != nil {
		log.Fatalf("Failed to open port on %s: %v", listenAddr, err)
	}
	defer listener.Close()

	log.Printf("Listening on %s\n", listenAddr)

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("Failed to accept connection: %v\n", err)
			continue
		}
		go handleConnection(conn, plug)
	}
}

func handleConnection(conn net.Conn, plug *SonoffPlug) {
	defer conn.Close()

	reader := bufio.NewReader(conn)
	var contentLength int
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				log.Printf("Error reading from connection: %v\n", err)
			}
			break
		}
		// Trim the line to remove \r\n
		trimmedLine := strings.TrimSpace(line)

		// Check for Content-Length header to determine the body size
		if strings.HasPrefix(trimmedLine, "Content-Length:") {
			fmt.Sscanf(trimmedLine, "Content-Length: %d", &contentLength)
		}

		// An empty line marks the end of the headers
		if trimmedLine == "" {
			break
		}
	}

	// Read the body based on the Content-Length
	bodyBytes := make([]byte, contentLength)
	if contentLength > 0 {
		_, err := io.ReadFull(reader, bodyBytes)
		if err != nil {
			log.Printf("Error reading body from connection: %v\n", err)
			return
		}
	}

	var update MonitoringData
	err := json.Unmarshal(bodyBytes, &update)
	if err != nil {
		log.Printf("Error translating body: %v\n", err)
		return
	}

	// should only update if this is for the right outlet.
	// NB: this is a bug in the sonoff imho. it's sending invalid data.
	if update.Outlet != plug.SocketID {
		return
	}

	plug.Monitoring = update

	log.Printf("Received sonoff update: %+v\n", update)
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
