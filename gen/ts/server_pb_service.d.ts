// package: relay
// file: server.proto

import * as server_pb from "./server_pb";
import * as meter_pb from "./meter_pb";
import {grpc} from "@improbable-eng/grpc-web";

type RelayUpdateServiceUpdateRelayState = {
  readonly methodName: string;
  readonly service: typeof RelayUpdateService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof meter_pb.RelayState;
  readonly responseType: typeof server_pb.UpdateResponse;
};

export class RelayUpdateService {
  static readonly serviceName: string;
  static readonly UpdateRelayState: RelayUpdateServiceUpdateRelayState;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class RelayUpdateServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  updateRelayState(
    requestMessage: meter_pb.RelayState,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: server_pb.UpdateResponse|null) => void
  ): UnaryResponse;
  updateRelayState(
    requestMessage: meter_pb.RelayState,
    callback: (error: ServiceError|null, responseMessage: server_pb.UpdateResponse|null) => void
  ): UnaryResponse;
}

