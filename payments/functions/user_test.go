package functions

import (
	"context"
	"testing"
	"time"
)

func TestOnUserCreated(t *testing.T) {
	ctx := context.Background()

	// Mock AuthEvent data
	e := AuthEvent{
		Email: "test@example.com",
		Metadata: struct {
			CreatedAt time.Time `json:"createdAt"`
		}{
			CreatedAt: time.Now(),
		},
		UID: "testUID",
	}

	// Call the function
	err := OnUserCreated(ctx, e)
	if err != nil {
		t.Fatalf("OnUserCreated returned an error: %v", err)
	}

}
