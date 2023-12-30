package common

import (
	"context"
	"testing"
)

func TestInitFirestore(t *testing.T) {
	fs, err := InitFirestore(context.Background())
	if err != nil {
		t.Error(err)
	}
	_ = fs
}
