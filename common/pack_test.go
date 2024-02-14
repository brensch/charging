package common

import (
	"context"
	"testing"

	"github.com/brensch/charging/gen/go/contracts"
	"google.golang.org/protobuf/proto"
)

func TestPackUnpackData(t *testing.T) {
	ctx := context.Background()

	// Initialize your protobuf message
	originalMessage := &contracts.PlugStatus{
		Id: "test_id",
	}

	// Pack the data
	packedData, err := PackData(ctx, originalMessage)
	if err != nil {
		t.Fatalf("PackData failed: %v", err)
	}

	// Prepare a new instance of your protobuf message to unpack the data into
	unpackedMessage := &contracts.PlugStatus{}

	// Unpack the data
	err = UnpackData(ctx, packedData, unpackedMessage)
	if err != nil {
		t.Fatalf("UnpackData failed: %v", err)
	}

	// Compare the original and unpacked messages
	if !proto.Equal(originalMessage, unpackedMessage) {
		t.Errorf("Unpacked message did not match original, got: %v, want: %v", unpackedMessage, originalMessage)
	}
}
