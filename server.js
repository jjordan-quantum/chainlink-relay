const express = require('express');
const bodyParser = require("body-parser");
const request = require("request");
const compute = require("./jobs/compute.js");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require('dotenv').config();

//Define some constants
const CHAINLINK_ACCESS_KEY = process.env.CHAINLINK_ACCESS_KEY;
const CHAINLINK_ACCESS_SECRET = process.env.CHAINLINK_ACCESS_SECRET;
const CHAINLINK_IP = process.env.CHAINLINK_IP;
const LISTEN_PORT = process.env.PORT;

// array for tracking Chainlink job IDs
const job_ids = [];


//======================================================================================================================
//
//  ENDPOINTS REQUIRED BY CHAINLINK NODE
//
//======================================================================================================================


/** Health check endpoint */
app.get('/', function (req, res) {
   res.sendStatus(200);
})


/** Called by chainlink node when a job is created using this external initiator */
app.post('/jobs', function (req, res) {
    //Recieves info from node about the job id
    job_ids.push(req.body.jobId) //save the job id
    res.sendStatus(200);
 })


/** Called by chainlink node when running the job */ 
app.get("/temp", function(req, res) {
    res.send({'temp': 42})
});


//======================================================================================================================
//
//  ENDPOINTS FOR REQUESTS FROM CHAINLINK NODE => 'EXTERNAL ADAPTOR'
//
//======================================================================================================================


/** echo_bridge
 *
 * Endpoint to echo 'message' field in request body from Chainlink node
 * note: this endpoint is set up as a bridge in the Node Operator UI
 * */
app.post("/echo", function(req, res) {

    console.log(req.body.data.message);
    res.sendStatus(200);
});


/** start_bridge
 *
 * Endpoint for request from Chainlink node to start an offchain computation process
 * note:    this endpoint is set up as a bridge in the Node Operator UI
 * */
app.post("/start", function(req, res) {

    // TODO - check that address and computeId fields exist in request
    let contractAddress = req.body.data.contractAddress;
    let computeId = req.body.data.computeId;

    // create and start compute job
    compute.addComputeJob(contractAddress, computeId);

    // response
    res.sendStatus(200);
});


/** stop_bridge
 *
 * Endpoint for request from Chainlink node to stop an offchain computation process
 * note:    this endpoint is set up as a bridge in the Node Operator UI
 * */
app.post("/stop", function(req, res) {

    // TODO - check that address and computeId fields exist in request
    let contractAddress = req.body.data.contractAddress;
    let computeId = req.body.data.computeId;

    // create and start compute job
    compute.killComputeJob(contractAddress, computeId);

    // response
    res.sendStatus(200);
});


/** callback_bridge
 *
 *  Endpoint for a request from a chainlink node, which includes a jobID in the request body data.
 *  The jobID is to be used in a job request to the node.
 *  note:   request params from the bridge request must include a "callbackJobId" field, which specifies the
 *          job that will be run by the node upon receiving the callback.
 */
app.post("/callback", function(req, res) {

    // get job ID from request
    let jobID = req.body.data.callbackJobId;

    // log request for callback job ID
    console.log("Request received from node to callback with job ID: " + jobID);

    // call chainlink node with callbackJobId from request body
    callChainlinkNode(jobID);
    res.sendStatus(200);
});


/** Endpoint to call chainlink node to run the test job */
app.post("/test", function(req, res) {

    // call chainlink node with job ID from request body
    callChainlinkNode(req.body.jobId);
    res.sendStatus(200);
});


//======================================================================================================================
//
//  FUNCTIONS TO CALLBACK CHAINLINK NODE => 'EXTERNAL INITIATOR'
//
//======================================================================================================================

// TODO - this will go in a separate module soon

/** Function to call the chainlink node and run a job */
function callChainlinkNode(job_id) {
    var url_addon = '/v2/specs/'+ job_id + '/runs'
    request.post({
        headers: {'content-type' : 'application/json', 'X-Chainlink-EA-AccessKey': CHAINLINK_ACCESS_KEY,
        'X-Chainlink-EA-Secret': CHAINLINK_ACCESS_SECRET},
        url:     CHAINLINK_IP+url_addon,
        body:    ""
      }, function(error, response, body){
        // updateCurrentActiveJob()
      });
    console.log("Job Sent")
}

//DEFINE SOME POLLING FUNCTION / SUBSCRIBE TO SOME WEBHOOK / DEFINE WHEN TO CALL CHAINLINK NODE

var server = app.listen(LISTEN_PORT, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
