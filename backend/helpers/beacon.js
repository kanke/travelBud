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
						onLoad(self);
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
		database.setBeacon(uuid, {safety: this.safety}, onSave, onFail);
	}
};

var getBeacon = function(uuid, options, onLoad, onFail) {
	var beacon = new Beacon(uuid);
	beacon.load(options, onLoad, onFail);
};

var setBeacon = function(uuid, data, onSet, onFail) {
	var beacon = new Beacon(uuid);
	beacon.load({}, function() {
		var changed = false;
		if (typeof(data.safety) === "string") {
			beacon.safety = data.safety;
			console.log("Set beacon " + uuid + " safety message to \"" + data.safety + "\"");
			changed = true;
		}
		if (changed)
			beacon.save(onSet, onFail);
		else {
			if (typeof(onSet) === "function") 
				onSet();
		}
	}, onFail);
}

exports.getBeacon = getBeacon;
exports.setBeacon = setBeacon;