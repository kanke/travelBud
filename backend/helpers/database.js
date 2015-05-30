var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();

var DB_FILE = "travelbud.db";

var ensureDB = function() {
	var exists = fs.existsSync(DB_FILE);
	if (!exists) {
		console.log("DATABASE: Missing database file " + DB_FILE);
		return false;
	}
	else
		return new sqlite3.Database(DB_FILE);
}

var getBeacon = function(uuid, success, fail) {
	
	if (typeof(uuid) !== "string") {
		console.log("DATABASE: Invalid beacon UUID " + uuid);
		return false;
	}
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	console.log("DATABASE: Getting beacon info for uuid " + uuid);
	
	var db = ensureDB();
	if (!db)
		return false;
	
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
};

var setBeacon = function(uuid, params, success, fail) {
	
	if (typeof(params) !== "object") {
		console.log("DATABASE: Set beacon called with invalid params");
		return false;
	}
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	var query = "UPDATE beacons SET ";
	var values = [];
	if (params.safety) {
		query = query + "safety = ?"
		values.push(params.safety);
	}
	if (values.length > 0) {
		var db = ensureDB();
		if (!db)
			return false;
		
		query = query + " WHERE uuid = ?";
		values.push(uuid);
		
		console.log("DATABASE: Saving beacon " + uuid + " properties to database");
		
		db.serialize(function() {
			db.run(query, values, function(err, row) {
				if (err) {
					console.log("DATABASE: Error in query (" + err.message + ")");
					if (fail) fail(err);
				}
				else {
					if (success) success();
				}
			});
		});
	}
	else {
		console.log("DATABASE: Set beacon called with no params to set");
		return false;
	}
	
};

var getBeaconList = function(success, fail) {
	console.log("DATABASE: Getting beacon list");
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	var db = ensureDB();
	if (!db)
		return false;
	
	db.all("SELECT uuid, safety FROM beacons", function(err, rows) {
		if (err) {
			console.log("DATABASE: Error in query (" + err.message + ")");
			if (fail) fail(err);
		}
		else {
			if (success) success(rows);
		}
	});
};

exports.getBeacon = getBeacon;
exports.setBeacon = setBeacon;
exports.getBeaconList = getBeaconList;