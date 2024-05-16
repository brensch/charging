package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"cloud.google.com/go/pubsub"
	"github.com/brensch/charging/common"
	"github.com/brensch/charging/electrical"
	"github.com/brensch/charging/gen/go/contracts"
)

func AnnounceDevices(ctx context.Context, ps *pubsub.Client, siteID string, plugs map[string]electrical.Plug, fuzes map[string]electrical.Fuze) error {
	newDevicesTopic := ps.Topic(common.TopicNameNewDevices)

	ackTopicName := fmt.Sprintf(common.TopicNameNewDevicesAck, siteID)
	_, ackSub, err := common.EnsureTopicAndSub(ctx, ps, ackTopicName)
	if err != nil {
		return err
	}

	var fuzeIDs, plugIDs []string
	for fuzeID := range fuzes {
		fuzeIDs = append(fuzeIDs, fuzeID)
	}
	for plugID := range plugs {
		plugIDs = append(plugIDs, plugID)
	}

	newDevicesAnnouncement := &contracts.DeviceAnnouncement{
		SiteId:  siteID,
		PlugIds: plugIDs,
		FuzeIds: fuzeIDs,
	}

	deviceBlob, _ := json.Marshal(newDevicesAnnouncement)
	log.Printf("announcing devices: %s", string(deviceBlob))

	newDevicesAnnouncementBytes, err := common.PackData(newDevicesAnnouncement)
	if err != nil {
		return err
	}
	// first send out the plug announcement
	res := newDevicesTopic.Publish(ctx, &pubsub.Message{
		Data: newDevicesAnnouncementBytes,
	})

	_, err = res.Get(ctx)
	if err != nil {
		return err
	}

	log.Println("waiting for mothership to ack devices")
	// once announced, listen for response
	receiveCtx, cancel := context.WithCancel(ctx)
	ackSub.Receive(receiveCtx, func(ctx context.Context, m *pubsub.Message) {

		// any message means acked, this should not fail
		// TODO: set timeout to notify not acked
		m.Ack()
		cancel()
	})
	log.Println("mothership acked devices")

	return nil

}
