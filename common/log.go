package common

import (
	"log/slog"
	"os"
)

var (
	Logger *slog.Logger
)

func init() {
	var handler slog.Handler
	if os.Getenv("FUNCTION_TARGET") != "" || os.Getenv("K_SERVICE") != "" {
		// Google Cloud environments: Use JSONHandler with "message" as the main field name
		handler = slog.NewJSONHandler(os.Stdout, nil)
		// TODO: update msg to message for google cloud logging
	} else {
		// Local or other environments: Use TextHandler
		handler = slog.NewTextHandler(os.Stdout, nil)
	}

	handler = slog.NewJSONHandler(os.Stdout, nil)

	Logger = slog.New(handler)
}
