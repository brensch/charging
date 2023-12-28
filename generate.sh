#!/bin/bash

# Exit on any error
set -e

# # Navigate to contracts directory to find the .proto files
# cd contracts

rm -rf ./gen
rm -rf ./frontend/src/contracts
mkdir -p ./gen/go
mkdir -p ./frontend/src/contracts

# Step 1: Generate Go code
protoc \
  -I=. \
  --go_out=./gen \
  --go-grpc_out=./gen \
  contracts/*.proto

# Step 2: Add Firestore struct tags to the generated Go code in snake_case
protoc \
  -I=. \
  --gotag_out=auto="firestore-as-snake",outdir="./gen":./ \
  contracts/*.proto

# Generate JavaScript and TypeScript code
# Note: For TypeScript generation, you need the protoc-gen-ts plugin.
# You can install it using npm.
# protoc --js_out=import_style=commonjs,binary:../frontend/src/proto --ts_out=service=grpc-web:../frontend/src/proto *.proto
protoc \
  --plugin=./frontend/node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out="service=grpc-web:./frontend/src" \
  --ts_proto_opt=esModuleInterop=true,snakeToCamel=false \
  contracts/*.proto

