// package: relay
// file: server.proto

var server_pb = require("./server_pb");
var meter_pb = require("./meter_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var RelayUpdateService = (function () {
  function RelayUpdateService() {}
  RelayUpdateService.serviceName = "relay.RelayUpdateService";
  return RelayUpdateService;
}());

RelayUpdateService.UpdateRelayState = {
  methodName: "UpdateRelayState",
  service: RelayUpdateService,
  requestStream: false,
  responseStream: false,
  requestType: meter_pb.RelayState,
  responseType: server_pb.UpdateResponse
};

exports.RelayUpdateService = RelayUpdateService;

function RelayUpdateServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

RelayUpdateServiceClient.prototype.updateRelayState = function updateRelayState(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RelayUpdateService.UpdateRelayState, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.RelayUpdateServiceClient = RelayUpdateServiceClient;

