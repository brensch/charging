package main

// func SendCommandResult(ctx context.Context, topic *pubsub.Topic, localStateResponse *contracts.LocalStateResponse) error {

// 	readingChunkBytes, err := proto.Marshal(localStateResponse)
// 	if err != nil {
// 		return err
// 	}

// 	// Create a buffer to hold the compressed data
// 	var b bytes.Buffer
// 	gz := gzip.NewWriter(&b)

// 	// Compress the data
// 	_, err = gz.Write(readingChunkBytes)
// 	if err != nil {
// 		return err
// 	}
// 	// Close the gzip writer to complete the compression
// 	err = gz.Close()
// 	if err != nil {
// 		return err
// 	}

// 	result := topic.Publish(ctx, &pubsub.Message{
// 		Data: []byte(b.Bytes()),
// 	})

// 	sendID, err := result.Get(ctx)
// 	if err != nil {
// 		return err
// 	}

// 	log.Println("sent local state response: ", sendID)
// 	return nil
// }

// func ReceiveCommandRequest(ctx context.Context, msg *pubsub.Message) (*contracts.LocalStateRequest, error) {

// 	// Decompress the data
// 	reader, err := gzip.NewReader(bytes.NewReader(msg.Data))
// 	if err != nil {
// 		log.Println("Error creating gzip reader:", err)
// 		msg.Ack()
// 		return nil, err
// 	}
// 	defer reader.Close()

// 	decompressedData, err := io.ReadAll(reader)
// 	if err != nil {
// 		log.Println("Error reading decompressed data:", err)
// 		msg.Ack()
// 		return nil, err
// 	}

// 	// Unmarshal the decompressed data into a ReadingChunk
// 	var localStateRequest contracts.LocalStateRequest
// 	err = proto.Unmarshal(decompressedData, &localStateRequest)
// 	if err != nil {
// 		log.Println("Error unmarshalling data:", err)
// 		msg.Ack()
// 		return nil, err
// 	}

// 	// Process the ReadingChunk
// 	log.Printf("Received request for plug%s %s\n", localStateRequest.SiteId, localStateRequest.PlugId)

// 	// Acknowledge the message
// 	msg.Ack()

// 	return &localStateRequest, nil
// }
