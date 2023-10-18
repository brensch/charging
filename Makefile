.PHONY: all mothership relaymanager run-mothership run-relaymanager

all: mothership relaymanager

mothership:
	@echo "Building mothership..."
	go build -o mothership-bin ./mothership

relaymanager:
	@echo "Building relaymanager..."
	go build -o relaymanager-bin ./relaymanager

run-mothership: mothership
	@echo "Running mothership..."
	./mothership-bin

run-relaymanager: relaymanager
	@echo "Running relaymanager..."
	./relaymanager-bin

build-deps:
	@echo "Installing dependencies..."
	go get -u google.golang.org/protobuf/cmd/protoc-gen-go
	go get -u google.golang.org/grpc/cmd/protoc-gen-go-grpc
	go get -u github.com/cespare/reflex

watch-mothership:
	reflex -r '\.go$$' -s -- sh -c 'go build -o mothership-bin ./mothership && ./mothership-bin'

watch-relaymanager:
	reflex -r '\.go$$' -s -- sh -c 'go build -o relaymanager-bin ./relaymanager && ./relaymanager-bin'

watch-all:
	make watch-mothership & make watch-relaymanager