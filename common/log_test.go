package common

import (
	"log/slog"
	"testing"
)

func TestLog(t *testing.T) {
	slog.SetDefault(Logger)

	slog.Info("yo", "hi", "yo")
}
