var http = require("http");
var https = require("https");
var moment = require("moment");

var API_URL = "http://api.sandbox.amadeus.com/v1.2";
var API_KEY = "Htey5SquONDzPU5LYHQLlAIkEdjmJtRK";

var LUFT_URL = "api.lufthansa.com";
var LUFT_CLIENT_ID = "xvz2y3jqht6r574nnth7m33d";
var LUFT_SECRET = "SPT3yzYfjz";
var LUFT_TOKEN = "6bvrauruhaqxuasrzy59vf86";
var LUFT_DATE_FORMAT = "YYYY-MM-DD[T]HH:mm";

var getAirport = function(code, success, fail) {
	
	if (typeof(code) !== "string") {
		console.log("AIRPORT API: Invalid IATA Code " + code);
		return false;
	}
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	console.log("AIRPORT API: Get airport with IATA code " + code);
	
	var now = moment();
	var startTime = now.format(LUFT_DATE_FORMAT);
	var endTime = now.add(30,"minutes").format(LUFT_DATE_FORMAT);
	var path = "/v1/operations/flightstatus/departures/" + code + "/" + startTime + "/" + endTime;
	
	var options = {
		host: LUFT_URL,
		path: path,
		method: 'GET',
		headers: {
			accept: 'application/json',
			authorization: "Bearer " + LUFT_TOKEN,
		}
	};

	var request = https.request(options, function(response) {
		var buffer = "";

		response.on("data", function (chunk) {
			buffer += chunk;
		}); 

		response.on("end", function (err) {
			if (err) {
				if (typeof(err) === "object") err = err.message;
				console.log("AIRPORT API: Error retrieving airport data " + err);
				if (fail) fail(err);
			}
			else {	
				try {
					var data = JSON.parse(buffer);
					if (data && data.FlightStatusResource && data.FlightStatusResource.Flights) {
						var airport = {
							code: code,
							flights: []
						};
						
						var flights = data.FlightStatusResource.Flights.Flight;
						for (var f in flights) {
							var flight = flights[f];
							console.log(flight);
							if (flight && flight.Departure.ScheduledTimeLocal) {
								var dep = moment(flight.Departure.ScheduledTimeLocal.DateTime);
								var gate = "";
								if (flights[f].Departure.Terminal)
									gate = flights[f].Departure.Terminal.Gate || "";
								var flight = {
									departure: dep.format("HH:mm"),
									gate: gate
								};
								airport.flights.push(flight);
							}
						}
						
						if (success) success(airport);
					}
					else {
						console.log("AIRPORT API: no flight data returned");
						if (fail) fail("No flight data returned");
					}
				}
				catch (jsonErr) {
					console.log("AIRPORT API: Error parsing API response " + jsonErr.message);
					if (fail) fail(jsonErr);
				}
			}
		}); 
	});

	request.end();
	
	//var airportUrl = API_URL + "/location/" + code + "/?" + "apikey=" + API_KEY;
	//var request = http.get(airportUrl, function (response) {});
}

exports.getAirport = getAirport;