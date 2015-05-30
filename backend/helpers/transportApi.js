var http = require("http");

var API_KEY = "e410843aa224fb8f054c77a167038fc1";
var APP_ID = "5a7b4a29";
var API_URL = "http://transportapi.com/v3/uk/bus";

var lat = 51.508960;
var lon = -0.132114;

// Process a list of departures grouped by route number
var processDepartures = function(departures, options) {	
	console.log("TRANSPORT API: Processing departures");
	if (options.direction)
		console.log("TRANSPORT API: Filtering on direction " + options.direction);
		
	var output = [];
	for (var route in departures) {
		console.log("Departures " + route);
		for (var j in departures[route]) {
			var dep = departures[route][j];
			if (!options.direction || options.direction == dep.direction)
			{
				output.push({
					route: route,
					time: dep.expected_departure_time,
					direction: dep.direction
				});
			}
		}
	}
	return output;
}

var getStop = function(atcocode, options, success, fail) {
	
	if (typeof(atcocode) !== "string") {
		console.log("TRANSPORT API: Invalid ATCO Code " + atcocode);
		return false;
	}
	
	options = (typeof(options) === "object") ? options : {};
	options.direction = (typeof(options.direction) === "string") ? options.direction : false;
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;

	var stopUrl = API_URL + "/stop/" + atcocode + "/live.json?"
		+ "api_key=" + API_KEY + "&app_id=" + APP_ID;
		
	console.log("TRANSPORT API: Getting data from " + stopUrl);
	
	var request = http.get(stopUrl, function (response) {
		var buffer = "";

		response.on("data", function (chunk) {
			buffer += chunk;
		}); 

		response.on("end", function (err) {
			if (err) {
				console.log("TRANSPORT API: Error retrieving stop data " + err.message);
				if (fail) fail(err);
			}
			else {	
				try {
					var data = JSON.parse(buffer);
					var stop = {
						time: data.request_time,
						departures: processDepartures(data.departures, options)
					};
					if (success) success(stop);
				}
				catch (jsonErr) {
					console.log("TRANSPORT API: Error parsing API response " + jsonErr.message);
					if (fail) fail(jsonErr);
				}
			}
		}); 
	});
	
	return true;
}

exports.getStop = getStop;