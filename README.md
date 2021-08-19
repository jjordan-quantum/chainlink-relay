# chainlink-relay

This repo is an adaptation of mycelium-ethereum/example-external-initiator-service...

The goal is to have a simple, lightweight express server to act as both an external intiator and an external adaptor for a Chainlink node.

When triggered by a bridge or httppost job, the express app will check blockchain state, perform computations, and send a job request back to the Chainlink node via an external initiator.  

This will be the first use case which will serve as a template for offchain computation.
