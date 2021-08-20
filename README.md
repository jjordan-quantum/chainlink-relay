# chainlink-relay

This repo is an adaptation of mycelium-ethereum/example-external-initiator-service...

The goal is to have a simple, lightweight express server to act as both an external intiator and an external adaptor for a Chainlink node.

When triggered by a bridge or httppost job, the express app will check blockchain state, perform computations, and send a job request back to the Chainlink node via an external initiator.  

This will be the first use case which will serve as a template for offchain computation.


## SAMPLE JOB SPECS

Here are a few job specs and processes for testing the app routes in server.js.

Assumptions:

You have allowed external intiators on your node.

You have the server.js running on the same machine as your node, listening on a local port.

You have created the external initiator in docker admin for the node.

You have an additional terminal session open to make post requests to the local port, which will initiate job runs for the tests (alternatively you can trigger the runs with a runlog, using an oracle contract - I will be trying that next).

NOTE: I do not provide the Job ID's when creating the jobs - those are generated.


###1. /start command

### General flow: chainlink test external-initiator -> start_bridge -> console.log 

- create start_bridge
- define job specs
- define post request to /test external initiator endpoint
- make request
- check console output in suspended screen session


start_bridge: 

http://<local_ip_address>:<listening_port>/start


job spec:

```
{
  "name": "relay-test-start-command",
  "initiators": [
    {
      "id": 21,
      "jobSpecId": "65cf5a3c-bd0d-479b-bd28-e8cb14ebfa82",
      "type": "external",
      "params": {
        "name": "test",
	"body: {}
      }
    }
  ],
  "tasks": [
    {
      "jobSpecId": "65cf5a3cbd0d479bbd28e8cb14ebfa82",
      "type": "start_bridge",
      "params": {
        "computeId": "0q9wergh08qewhrg8",
        "contractAddress": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
      }
    }
  ]
}
```


post request:

curl -X POST http://localhost:<listening_port>/test -H 'Content-Type: application/json' -d '{"jobId":"65cf5a3c-bd0d-479b-bd28-e8cb14ebfa82"}'


console result:
```
Job Sent
STARTING compute job with the following arguments:
Contract Address: 0xE592427A0AEce92De3Edee1F18E0157C05861564
Compute Job ID: 0q9wergh08qewhrg8
```



###2. /stop command

### General flow: chainlink test external-initiator -> stop_bridge -> console.log 

- create stop_bridge
- define job specs
- define post request to /test external initiator endpoint
- make request
- check console output in suspended screen session


stop_bridge: 

http://<local_ip_address>:<listening_port>/stop



job spec:

```
{
  "name": "relay-test-stop-command",
  "initiators": [
    {
      "id": 22,
      "jobSpecId": "0fa0f836-94d4-447a-b83d-dc2848a44418",
      "type": "external",
      "params": {
        "name": "test",
	"body: {}
      }
    }
  ],
  "tasks": [
    {
      "jobSpecId": "0fa0f83694d4447ab83ddc2848a44418",
      "type": "stop_bridge",
      "params": {
        "computeId": "0q9wergh08qewhrg8",
        "contractAddress": "0xE592427A0AEce92De3Edee1F18E0157C05861564"
      }
    }
  ]
}
```


post request:

curl -X POST http://localhost:<listening_port>/test -H 'Content-Type: application/json' -d '{"jobId":"0fa0f836-94d4-447a-b83d-dc2848a44418"}'


console result:
```
Job Sent
KILLING compute job with the following arguments:
Contract Address: 0xE592427A0AEce92De3Edee1F18E0157C05861564
Compute Job ID: 0q9wergh08qewhrg8
```



###3. /callback command

### General flow: chainlink test external-initiator -> callback_bridge -> test external initiator -> echo_bridge

- create callback_bridge
- define job specs: external -> callback_bridge
- define job specs for callback job: external_initiator -> echo_bridge 
- define post request to /test external initiator endpoint
- make request
- check console output in suspended screen session



echo_bridge:

http://<local_ip_address>:<listening_port>/echo



job spec for callback request (via echo_bridge):

```
{
  "name": "relay-test-echo-bridge",
  "initiators": [
    {
      "id": 23,
      "jobSpecId": "749b6763-71e1-42c2-9ab6-dee15f8cfe45",
      "type": "external",
      "params": {
        "name": "test",
	"body: {}
      }
    }
  ],
  "tasks": [
    {
      "jobSpecId": "749b676371e142c29ab6dee15f8cfe45",
      "type": "echo_bridge",
      "params": {
        "message": "TEST ECHO BRIDGE"
      }
    }
  ]
}
```


post request to test above job:

curl -X POST http://localhost:<listening_port>/test -H 'Content-Type: application/json' -d '{"jobId":"749b6763-71e1-42c2-9ab6-dee15f8cfe45"}'


console result:
```
Job Sent
TEST ECHO BRIDGE
```


callback_bridge:

http://<local_ip_address>:<listening_port>/callback


job spec for callback job, which will intitiate the callback request which will trigger the echo request job:

```
{
  "name": "relay-test-callback-bridge",
  "initiators": [
    {
      "id": 24,
      "jobSpecId": "91b6ab30-e3fd-4334-8f63-b0dcdd7a9ae7",
      "type": "external",
      "params": {
        "name": "test",
	"body: {}
      }
    }
  ],
  "tasks": [
    {
      "jobSpecId": "91b6ab30e3fd43348f63b0dcdd7a9ae7",
      "type": "callback_bridge",
      "params": {
        "callbackJobId": "749b6763-71e1-42c2-9ab6-dee15f8cfe45"
      }
    }
  ]
}
```


post request:

curl -X POST http://localhost:<listening_port>/test -H 'Content-Type: application/json' -d '{"jobId":"91b6ab30-e3fd-4334-8f63-b0dcdd7a9ae7"}'


console result:
```
Job Sent
Request received from node to callback with job ID: 749b6763-71e1-42c2-9ab6-dee15f8cfe45
Job Sent
TEST ECHO BRIDGE
```



