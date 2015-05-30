var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();

var DB_FILE = "travelbud.db";

var getBeacon = function(uuid, success, fail) {
	
	if (typeof(uuid) !== "string") {
		console.log("DATABASE: Invalid beacon UUID " + uuid);
		return false;
	}

	var exists = fs.existsSync(DB_FILE);
	if (!exists) {
		console.log("DATABASE: Missing database file " + DB_FILE);
		return false;
	}
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	console.log("DATABASE: Getting beacon info for uuid " + uuid);
	
	var db = new sqlite3.Database(DB_FILE);
	
	db.serialize(function() {
		db.get("SELECT * FROM beacons " + 
				"LEFT JOIN beacons_stations ON beacons.id = beacons_stations.beacon_id " + 
				"LEFT JOIN stations ON beacons_stations.station_id = stations.id " +
				"WHERE beacons.uuid=?", uuid, function(err, row) {
			if (err) {
				console.log("DATABASE: Error in query (" + err.message + ")");
				if (fail) fail(err);
			}
			else {
				if (success) success(row);
			}
		});
	});
	
	db.close();
	return true;	
}

exports.getBeacon = getBeacon;