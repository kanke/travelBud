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

function beacon(response, request) {
	console.log("Received request for beacon.");
	
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
	
	// Get Post data
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
			getBeaconJSON(uuid, {
				loadStation: true,
				direction: query.direction || ""
			}, response);
		}
	});
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