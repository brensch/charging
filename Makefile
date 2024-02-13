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
RELAYMANAGER_SERVICE_FILE=relaymanager.service
RELAYMANAGER_CONF_FILE=journald.conf

MOTHERSHIP_HOST=mothership
MOTHERSHIP_USER=niquist
MOTHERSHIP_BINARY=mothership-bin
MOTHERSHIP_SERVICE_FILE=mothership.service
MOTHERSHIP_CONF_FILE=journald.conf


# Compile the relaymanager binary for a relaymanager target
build-relaymanager:
	@echo "Building relaymanager..."
	env GOOS=linux GOARCH=arm GOARM=7 go build \
		-o $(RELAYMANAGER_BINARY) ./relaymanager 

# Compile the mothership binary for a relaymanager target
build-mothership:
	@echo "Building mothership..."
	GOOS=linux go build -ldflags="-s -w" -trimpath \
		-o $(MOTHERSHIP_BINARY) ./mothership 

# Deploy the relaymanager binary to the relaymanager
deploy-relaymanager: build-relaymanager
	@echo "Deploying relaymanager to relaymanager..."
	tsh scp $(RELAYMANAGER_BINARY) \
		$(RELAYMANAGER_USER)@$(RELAYMANAGER_HOST):.

# Deploy the mothership binary to the mothership
deploy-mothership: build-mothership
	@echo "Deploying mothership to mothership..."
	tsh scp $(MOTHERSHIP_BINARY) \
		$(MOTHERSHIP_USER)@$(MOTHERSHIP_HOST):.

# Deploy the relaymanager systemd service and journald configuration to the relaymanager
deploy-mothership-service: deploy-mothership
	@echo "Deploying mothership service to mothership..."
	tsh scp ./mothership/$(MOTHERSHIP_SERVICE_FILE) \
		root@$(MOTHERSHIP_HOST):/tmp
	tsh scp ./mothership/$(MOTHERSHIP_CONF_FILE) \
		root@$(MOTHERSHIP_HOST):/tmp
	tsh ssh root@$(MOTHERSHIP_HOST) 'mv /tmp/$(MOTHERSHIP_SERVICE_FILE) /etc/systemd/system/ && \
		mv /tmp/$(MOTHERSHIP_CONF_FILE) /etc/systemd/journald.conf && \
		systemctl restart systemd-journald && \
		systemctl daemon-reload && \
		systemctl enable mothership.service && \
		systemctl start mothership.service'

# Deploy the relaymanager systemd service and journald configuration to the relaymanager
deploy-relaymanager-service:
	@echo "Deploying relaymanager service to relaymanager..."
	tsh scp ./relaymanager/$(RELAYMANAGER_SERVICE_FILE) \
		root@$(RELAYMANAGER_HOST):/tmp
	tsh scp ./relaymanager/$(RELAYMANAGER_CONF_FILE) \
		root@$(RELAYMANAGER_HOST):/tmp
	tsh ssh root@$(RELAYMANAGER_HOST) 'mv /tmp/$(RELAYMANAGER_SERVICE_FILE) /etc/systemd/system/ && \
		mv /tmp/$(RELAYMANAGER_CONF_FILE) /etc/systemd/journald.conf && \
		systemctl restart systemd-journald && \
		systemctl daemon-reload && \
		systemctl enable relaymanager.service && \
		systemctl start relaymanager.service'

# Main target to deploy both the relaymanager binary and its service
all: deploy-relaymanager deploy-service
