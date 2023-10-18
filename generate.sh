#!/bin/bash

# Exit on any error
set -e

# Navigate to contracts directory to find the .proto files
cd contracts

mkdir -p ../gen/go
mkdir -p ../gen/ts

npm install -g ts-protoc-gen
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Generate Go code
protoc --go_out=../gen --go-grpc_out=../gen *.proto

# Generate JavaScript and TypeScript code
# Note: For TypeScript generation, you need the protoc-gen-ts plugin.
# You can install it using npm.
protoc --js_out=import_style=commonjs,binary:../gen/ts --ts_out=service=grpc-web:../gen/ts *.proto

# Navigate back to the root
cd ..
