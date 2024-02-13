# Define phony targets to ensure commands are always executed
.PHONY: all mothership relaymanager run-mothership run-relaymanager build-proto deps-proto-generator generate-proto build-relaymanager deploy-relaymanager deploy-service

# Build the protocol buffer generator Docker image
deps-proto-generator:
	docker build -f ./contracts/dockerfile.generateproto -t protogen .

# Generate protocol buffers using the Docker image
generate-proto:
	docker run -v $(PWD):/app protogen /bin/bash /app/generate.sh

# Configuration variables
RELAYMANAGER_HOST=ubuntu-pi-server
RELAYMANAGER_USER=niquist
RELAYMANAGER_BINARY=relaymanager-bin
SERVICE_FILE=relaymanager.service
CONF_FILE=journald.conf

# Compile the relaymanager binary for a relay manager target
build-relaymanager:
	@echo "Building relaymanager..."
	env GOOS=linux GOARCH=arm GOARM=7 go build \
		-o $(RELAYMANAGER_BINARY) ./relaymanager 

# Deploy the relaymanager binary to the relay manager
deploy-relaymanager: build-relaymanager
	@echo "Deploying relaymanager to relay manager..."
	tsh scp $(RELAYMANAGER_BINARY) \
		$(RELAYMANAGER_USER)@$(RELAYMANAGER_HOST):.

# Deploy the relaymanager systemd service and journald configuration to the relay manager
deploy-service:
	@echo "Deploying relaymanager service to relay manager..."
	tsh scp ./relaymanager/$(SERVICE_FILE) \
		root@$(RELAYMANAGER_HOST):/tmp
	tsh scp ./relaymanager/$(CONF_FILE) \
		root@$(RELAYMANAGER_HOST):/tmp
	tsh ssh root@$(RELAYMANAGER_HOST) 'mv /tmp/$(SERVICE_FILE) /etc/systemd/system/ && \
		mv /tmp/$(CONF_FILE) /etc/systemd/journald.conf && \
		systemctl restart systemd-journald && \
		systemctl daemon-reload && \
		systemctl enable relaymanager.service && \
		systemctl start relaymanager.service'

# Main target to deploy both the relaymanager binary and its service
all: deploy-relaymanager deploy-service
