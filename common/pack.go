package common

import (
	"bytes"
	"compress/gzip"
	"context"
	"io"
	"log"

	"google.golang.org/protobuf/proto"
)

// UnpackData generic function to unpack and decompress data into a protobuf message.
func UnpackData(ctx context.Context, data []byte, result proto.Message) error {
	// Decompress the data
	reader, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		log.Println("Error creating gzip reader:", err)
		return err
	}
	defer reader.Close()

	decompressedData, err := io.ReadAll(reader)
	if err != nil {
		log.Println("Error reading decompressed data:", err)
		return err
	}

	// Unmarshal the decompressed data into the provided protobuf message
	err = proto.Unmarshal(decompressedData, result)
	if err != nil {
		log.Println("Error unmarshalling data:", err)
		return err
	}

	return nil
}

// PackData function to marshal a protobuf message and compress the data.
func PackData(ctx context.Context, message proto.Message) ([]byte, error) {
	// Marshal the protobuf message
	marshaledData, err := proto.Marshal(message)
	if err != nil {
		log.Println("Error marshalling data:", err)
		return nil, err
	}

	// Compress the marshaled data using gzip
	var buf bytes.Buffer
	writer := gzip.NewWriter(&buf)

	_, err = writer.Write(marshaledData)
	if err != nil {
		log.Println("Error writing compressed data:", err)
		return nil, err
	}

	// It's important to close the writer to flush the compression buffer and write the gzip footer
	if err := writer.Close(); err != nil {
		log.Println("Error closing gzip writer:", err)
		return nil, err
	}

	return buf.Bytes(), nil
}
