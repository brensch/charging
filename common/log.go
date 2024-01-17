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
	if os.Getenv("FUNCTION_TARGET") != "" || os.Getenv("K_SERVICE") != "" || true {
		// Google Cloud environments: Use custom JSONHandler
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{

			ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
				switch a.Key {
				case slog.LevelKey:
					return slog.Attr{
						Key:   "severity",
						Value: a.Value,
					}

				case slog.MessageKey:
					return slog.Attr{
						Key:   "message",
						Value: a.Value,
					}
				}

				return a
			},
		},
		)
	} else {
		// Local or other environments: Use TextHandler
		handler = slog.NewTextHandler(os.Stdout, nil)
	}

	Logger = slog.New(handler)
}
