# charging

## High level thoughts

- Using gcp pubsub for IPC.
  - Started with firestore but doing the maths this was going to become extremely expensive for the throughput we need.
  - Went event based over grpc for telemetry collection since we may want to feed our data to multiple locations. For the time being a single binary can handle everything serverside, but would be good to set up some real data pipeline stuff if we get big.
- Firestore for frontend concerns, including gathering user input. This is still easier than setting up grpc just for user input.
- I believe a micro vm with a single binary actually ends up being the cheapest option for our usecase. Keeping track of recent state in memory, rather than relying on constantly polling influx is a far superior option from a cost and simplicity perspective. Serverless doesn't seem to fit here.
-

## Services

### Relaymanager

This runs on the raspberry pi locally to the site. Its main role is to take readings from the devices locally and then perform commands of the plugs in response to events from the mothership.

#### Done

- Most of the shelly library interface
- Discovery concept (using mdns which is pretty cool for shelly)
- Interfaces seem correct from prototyping
- Wrapper to loop the reading of devices and publish to pubsub

#### TODO

- Ensure there is a way to consistently globally identify each plug that persists. Hoping MAC address achieves this.
- Command receiving now we've switched to pubsub
- Make code good once finished prototyping

### Mothership

This runs serverside, and will be responsible for managing all state machines. As each chunk of data comes in from the site, we will compute if a state transition has occurred based on the information in that chunk of readings. Things outside of just reading values will need to be used as inputs to the state machine, such as time since last transitions. The local state machines are stored in memory in a big map for each plug being managed. This means we will be able to avoid ingress/egress costs to DBs, only writing batched data periodically out.

#### Done

- Pubsub interface including compression technique and contracts for IPC
- State machine calculation wireframe

#### TODO

- More fully fledged state machine
- Batched output to influx

### Payments

Annoyingly the built in firebase plugin for stripe was buggy and seems to have fallen out of support. Reimplemented myself, it is probably a good thing since the prepaid pattern is a bit awkward using the plugin.

Basic gist is when a user signs into the frontend, I make a stripe user with their google details. They then manage their payment methods through the stripe portal. They can set up a payment method that gives us a token that we are able to use to programmatically charge them in the future. Have also added an endpoint to construct a stripe page to just make a one off payment.

#### Done

- Everything needed at this point, may change.

## Notes

The root of the repo is the package 'functions' to be deployed as cloud functions. This is due to CICD limitations of the gcloud run deploy command requiring a go.mod in the subdirectory to have context of the packages used.

Using federated identity for deployments, found in .github folder.

`./common` contains shared functionality.

`./provisioner` will automatically generate new keys for new sites, could be handy at scale.

`./contracts` are the common objects we'll be using, defined in protobuf. They will be used as both the firestore documents and pubsub payloads. Running `make generate-proto` will update the `./gen` directory with any changes you've made.
