var database = require("./database");
var airportApi = require("./airportApi");
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
		onFail = (typeof(onFail) === "function") ? onFail : null
		
		if (!this.transport) {
			onFail("Error retrieving stop data - transport type missing");
			return;
		}
		
		switch(this.transport) {
			case "bus":	
				if (self.stationCode) {
					transportApi.getStop(self.stationCode, options, 
						function(stop) {			
							self.station = stop;
							if (onLoad)
								onLoad(self);
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
				
			case "airport":
				if (self.stationCode) {
					airportApi.getAirport(self.stationCode, 
						function(airport) {			
							self.station = airport;
							if (onLoad)
								onLoad(self);
						}, 
						function(err) {
							if (typeof(err) === "object") err = err.msg;
							if (onFail)
								onFail("Error retrieving airport data - " + err);
						}
					);
				}
				else {
					onFail("Error retrieving airport data - code missing");
				}
				break;
				
			default:
				onFail("Station type " + self.transport + " not implemented");
		}
	};
	
	/* Create a new beacon in the database */
	this.create = function(onLoad, onFail) {
		onLoad = (typeof(onLoad) === "function") ? onLoad : null;
		onFail = (typeof(onFail) === "function") ? onFail : null;
		database.checkBeacon(self.uuid, function(exists) {
			if (exists)
				onFail("Beacon with UUID " + self.uuid + " already exists");
			else
				database.addBeacon(self.uuid, onLoad, onFail);
		}, onFail);
	};
	
	/* Load beacon from database */
	this.load = function(options, onLoad, onFail) {
		onLoad = (typeof(onLoad) === "function") ? onLoad : null;
		onFail = (typeof(onFail) === "function") ? onFail : null;
		options = (typeof(options) === "object") ? options : {};
		
		options.loadStation = options.loadStation || false;
		
		database.getBeacon(self.uuid, 
			function(row) {
				if (row) {
					self.safety = (row.safety || "");
					if (row.transport) {
						self.transport = row.transport;
						self.stationCode = (row.code || "");
						if (options.loadStation)
							self.updateApi(options, onLoad, onFail);
						else
							onLoad(self);
					}
					else {
						onLoad(self);
					}
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
	
	/* Save beacon to database */
	this.save = function(onSave, onFail) {
		var params = {safety: this.safety};
		database.setBeacon(uuid, params, onSave, onFail);
	}
};

var update = function(beacon, data, onSave, onFail) {
	var changed = false;
	if (typeof(data.safety) === "string") {
		beacon.safety = data.safety;
		console.log("Set beacon " + beacon.uuid + " safety message to \"" + data.safety + "\"");
		changed = true;
	}
	if (changed) {
		beacon.save(onSave, onFail);
	}
	else {
		if (typeof(onSave) === "function") 
			onSave();
	}
};

var addBeacon = function(uuid, data, onCreate, onFail) {
	data = data || {};
	var beacon = new Beacon(uuid);
	beacon.create(function() {
		console.log("Created beacon");
		update(beacon, data, onCreate, onFail);
	}, onFail);
};

var getBeacon = function(uuid, options, onLoad, onFail) {
	var beacon = new Beacon(uuid);
	beacon.load(options, onLoad, onFail);
};

var setBeacon = function(uuid, data, onSet, onFail) {
	data = data || {};
	var beacon = new Beacon(uuid);
	beacon.load({}, function() {
		update(beacon, data, onSet, onFail);
	}, onFail);
}

exports.addBeacon = addBeacon;
exports.getBeacon = getBeacon;
exports.setBeacon = setBeacon;