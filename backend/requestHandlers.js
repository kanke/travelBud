var querystring = require("querystring");
var url = require("url");
var database = require("./helpers/database");
var transportApi = require("./helpers/transportApi");

function beaconList(response) {
	var body = "<html>" +
		"<head>" + 
		"<meta http-equiv=\"Content-Type\" content=\"text/html\"; charset=UTF-8\"/>" +
		"</head>" +
		"<body>" + 
		"<h1>Beacon List</h1>"
		"</body>" +
		"</html>";
		
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
}

function beacon(response, request) {
	console.log("Received request for beacon.");
	
	// Get Beacon UUID
	var queryStr = url.parse(request.url).query;
	var query = querystring.parse(queryStr);
	
	if (query.uuid === undefined) {
		response.writeHead(400, {"Content-Type": "text/html"});
		response.write("Could not find beacon - UUID required");
		response.end();
	}
	
	var options = {};
	if (query.direction) {
		options.direction = query.direction;
	}
	
	// Get beacon data from database
	var beacon = database.getBeacon(query.uuid,
		function(beacon) {
			if (beacon && beacon.transport && beacon.code) {
				
				switch(beacon.transport) {
					case "bus":	
						var stop = transportApi.getStop(beacon.code, options, function(stop) {			
							response.writeHead(200, {"Content-Type": "application/json"});
							response.write(JSON.stringify({
								uuid: query.uuid,
								stop: stop
							}))
							response.end();
						},
						function(err) {
							response.writeHead(500, {"Content-Type": "text/html"});
							response.write("Error retrieving stop data");
							response.end();
						});
						break;
						
					case "airport":
						break;
						
					default:
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Station type " + beacon.transport + " not implemented");
						response.end();
				}
				
			}
			else {
				response.writeHead(500, {"Content-Type": "text/html"});
				response.write("Error getting stop data");
				response.end();
			}
		},
		function(err) {
			response.writeHead(500, {"Content-Type": "text/html"});
			response.write("Error retrieving beacon from database");
			response.end();
		}
	);
	
	if (!beacon) {
		response.writeHead(500, {"Content-Type": "text/html"});
		response.write("Could not get beacon from database");
		response.end();
	}
}

exports.beaconList = beaconList;
exports.beacon = beacon;