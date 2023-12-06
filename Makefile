.PHONY: all mothership relaymanager run-mothership run-relaymanager build-proto

run-relaymanager: relaymanager
	@echo "Running relaymanager..."
	./relaymanager-bin

build-deps:
	@echo "Installing dependencies..."
	go get -u github.com/cespare/reflex

watch-relaymanager:
	reflex -r '\.go$$' -s -- sh -c 'go build -o relaymanager-bin ./relaymanager && ./relaymanager-bin'

build-proto:
	@echo "User ID: $(shell id -u), Group ID: $(shell id -g)"
	@echo "Building proto assets with Docker..."
	docker build -f dockerfile.generateproto -t protogen .
	docker run -v $(PWD):/app protogen /bin/bash /app/generate.sh