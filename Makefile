.PHONY: all mothership relaymanager run-mothership run-relaymanager build-proto

run-relaymanager: relaymanager
	@echo "Running relaymanager..."
	./relaymanager-bin

build-deps: build-proto-generator
	@echo "Installing dependencies..."
	go get -u github.com/cespare/reflex

watch-relaymanager:
	reflex -r '\.go$$' -s -- sh -c 'go build -o relaymanager-bin ./relaymanager && ./relaymanager-bin'

build-proto-generator:
	docker build -f ./contracts/dockerfile.generateproto -t protogen .

generate-proto:
	docker run -v $(PWD):/app protogen /bin/bash /app/generate.sh