var database = require("./database");
var transportApi = require("./transportApi");

var Beacon = function(uuid) {
	
	var self = this;
	
	// Beacon properties
	this.uuid = uuid;
	this.transport = "";
	this.safety = "";
	this.stationCode = "";
	this.station = null;
	
	/* Update station information from web APIs */
	this.updateApi = function(options, onLoad, onFail) {
		options = (options || {});
		onLoad = (typeof(onLoad) === "function") ? onLoad : null;
		onFail = (typeof(onFail) === "function") ? onFail : null;
		
		switch(this.transport) {
			case "bus":	
				if (self.stationCode) {
					transportApi.getStop(self.stationCode, options, 
						function(stop) {			
							self.station = stop;
							if (onLoad)
								onLoad();
						}, 
						function(err) {
							if (typeof(err) === "object") err = err.msg;
							if (onFail)
								onFail("Error retrieving stop data - " + err);
						}
					);
				}
				else {
					onFail("Error retrieving stop data - code missing");
				}
				break;
				
			//case "airport":
			//	break;
				
			default:
				onFail("Station type " + self.transport + " not implemented");
		}
	};
	
	this.load = function(options, onLoad, onFail) {
		onLoad = (typeof(onLoad) === "function") ? onLoad : null;
		onFail = (typeof(onFail) === "function") ? onFail : null;
		options = (typeof(options) === "object") ? options : {};
		
		options.loadStation = options.loadStation || false;
		
		database.getBeacon(self.uuid, 
			function(row) {
				if (row && row.transport) {
					self.safety = (row.safety || "");
					self.transport = row.transport;
					self.stationCode = (row.code || "");
					if (options.loadStation)
						self.updateApi(options, onLoad, onFail);
					else
						onLoad();
				}
				else {
					if (onFail)
						onFail("Could not find beacon with uuid = " + self.uuid);
				}
			},
			function(err) {
				if (typeof(err) === "object") err = err.msg;
				if (onFail)
					self.onFail("Error retrieving beacon from database: " + err);
			}
		);
	}	
};

exports.Beacon = Beacon;