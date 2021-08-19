var express = require('express');
var bodyParser = require("body-parser");
var request = require("request")
require('dotenv').config();
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Define some constants
const CHAINLINK_ACCESS_KEY = process.env.CHAINLINK_ACCESS_KEY;
const CHAINLINK_ACCESS_SECRET = process.env.CHAINLINK_ACCESS_SECRET;
const CHAINLINK_IP = process.env.CHAINLINK_IP;
const LISTEN_PORT = process.env.PORT;

var job_ids = []

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

/** Endpoint to call chainlink node to run the test job */
app.post("/test", function(req, res) {
    //Call chainlink node with job ID from request body
    callChainlinkNode(req.body.jobId);
    res.sendStatus(200);
});

/** Endpoint to echo callback from chainlink node */
app.post("/echo", function(req, res) {
    console.log(req.params.message);
    res.sendStatus(200);
})

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
