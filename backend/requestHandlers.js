var querystring = require("querystring");
var fs = require("fs");
var url = require("url");
var database = require("./helpers/database");
var beaconLib = require("./helpers/beacon");

/* Return beacon as JSON */
function getBeaconJSON(uuid, options, response) {
	beaconLib.getBeacon(uuid, options,
		function(b) {
			response.writeHead(200, {"Content-Type": "text/json"});
			response.write(JSON.stringify({
				uuid: b.uuid,
				safety: b.safety,
				station: b.station
			}));
			response.end();
		},
		function(err) {
			response.writeHead(400, {"Content-Type": "text/json"});
			response.write("{error: \"Error loading beacon: " + err + "\"}");
			response.end();	
		}
	);
}

function index(response) {
	fs.readFile('./ui/index.html', function (err, html) {
		if (err) {
			response.writeHead(400, {"Content-Type": "text/html"});
			response.write("Could not load index page - " + err.msg);
			response.end(); 
		}       
		else {  
			response.writeHeader(200, {"Content-Type": "text/html"});  
			response.write(html);  
			response.end();  
		}
	});
}

/* Process a beacon post (update) request */
function beaconPost(uuid, response, request) {
	var postData = "";
	request.setEncoding("utf8");
	request.addListener("data", function(postDataChunk) {
		postData += postDataChunk;
	});
	
	request.addListener("end", function() {
		if (postData.length > 0) {
			postData = querystring.parse(postData);
			values = {};
			if (typeof(postData.safety) === "string") {
				values.safety = postData.safety
			}
			beaconLib.setBeacon(uuid, values, function() {
				getBeaconJSON(uuid, {}, response);
			}, 
			function() {
				response.writeHead(400, {"Content-Type": "text/json"});
				response.write("{error: \"Error saving beacon: " + err + "\"}");
				response.end();	
			});
		}
		else {
			getBeaconJSON(uuid, {}, response);
		}
	});	
}

/* Process a beacon put (create) request */
function beaconPut(uuid, response, request) {
	
	var putData = "";
	request.setEncoding("utf8");
	request.addListener("data", function(putDataChunk) {
		putData += putDataChunk;
	});
	
	request.addListener("end", function() {
		if (putData.length > 0) {
			putData = querystring.parse(putData);
			values = {};
			if (typeof(putData.safety) === "string") {
				values.safety = putData.safety
			}
			beaconLib.addBeacon(uuid, values, function() {
				getBeaconJSON(uuid, {}, response);
			}, 
			function(err) {
				response.writeHead(400, {"Content-Type": "text/json"});
				response.write("{error: \"Error saving beacon: " + err + "\"}");
				response.end();	
			});
		}
		else {
			getBeaconJSON(uuid, {}, response);
		}
	});	
}

function beacon(response, request) {
	
	// Get Beacon UUID
	var queryStr = url.parse(request.url).query;
	var query = querystring.parse(queryStr);
	
	if (query.uuid === undefined) {
		response.writeHead(400, {"Content-Type": "text/html"});
		response.write(JSON.stringify({error: "Could not find beacon - UUID required"}));
		response.end();
		return;
	}
	
	var uuid = query.uuid.toUpperCase();
	var options = {
		direction: query.direction || ""
	};
	
	switch (request.method.toUpperCase())
	{
		case "POST":
			console.log("Received POST request for beacon " + uuid);
			beaconPost(uuid, response, request);
			break;
			
		case "PUT":
			console.log("Received PUT request for beacon " + uuid);
			beaconPut(uuid, response, request);
			break;
			
		case "GET":
		default:
			console.log("Received request for beacon " + uuid);
			options.loadStation = true;
			getBeaconJSON(uuid, options, response);
			break;
	}
	
	
};

var beaconList = function(response) {
	database.getBeaconList(function(rows) {
		var beacons = [];
		for (var i in rows) {
			beacons.push(rows[i]);
		}
		response.writeHead(200, {"Content-Type": "text/json"});
		response.write(JSON.stringify({beacons: beacons}));
		response.end();	
	},
	function(err) {
		if (typeof(err) === "object") err = err.msg;	
		response.writeHead(400, {"Content-Type": "text/json"});
		response.write("{error: \"Error loading beacon list: " + err + "\"}");
		response.end();	
	});
}

exports.index = index;
exports.beacon = beacon;
exports.beaconList = beaconList;