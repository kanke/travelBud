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

var checkBeacon = function(uuid, success, fail) {
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	if (typeof(uuid) !== "string") {
		if (fail) fail("Invalid beacon UUID " + uuid);
		return;
	}

	console.log("DATABASE: Checking beacon info for uuid " + uuid);
	
	var db = ensureDB();
	if (!db) {
		if (fail) fail("Could not connect to database");
		return;
	}
	
	db.get("SELECT * FROM beacons " + 
			"WHERE beacons.uuid=?", uuid, function(err, row) {
		if (err) {
			console.log("DATABASE: Error in query (" + err.message + ")");
			if (fail) fail(err);
		}
		else {
			if (success) success(row !== undefined);
		}
	});
	
	db.close();	
}

var getBeacon = function(uuid, success, fail) {
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	if (typeof(uuid) !== "string") {
		if (fail) fail("Invalid beacon UUID " + uuid);
		return;
	}
	
	console.log("DATABASE: Getting beacon info for uuid " + uuid);
	
	var db = ensureDB();
	if (!db) {
		if (fail) fail("Could not connect to database");
		return;
	}
	
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
};

var addBeacon = function(uuid, success, fail) {
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	var db = ensureDB();
	if (!db) {
		if (fail) fail("Could not connect to database");
		return;
	}
	
	db.run("INSERT INTO beacons (uuid) VALUES (?)", uuid, function(err) {
		if (err) {
			console.log("DATABASE: Error in query (" + err.message + ")");
			if (fail) fail(err);
		}
		else {
			if (success) success();
		}
	});
	
	db.close();
}

var setBeacon = function(uuid, params, success, fail) {
	
	success = (typeof(success) === "function") ? success : null;
	fail = (typeof(fail) === "function") ? fail : null;
	
	if (typeof(params) !== "object") {
		if (fail) fail("Set beacon called with invalid params");
		return;
	}
	
	var query = "UPDATE beacons SET ";
	var values = [];
	if (params.safety) {
		query = query + "safety = ?"
		values.push(params.safety);
	}
	if (values.length > 0) {
		var db = ensureDB();
		if (!db) {
			if (fail) fail("Could not connect to database");
			return;
		}
		
		query = query + " WHERE uuid = ?";
		values.push(uuid);
		
		console.log("DATABASE: Saving beacon " + uuid + " properties to database");
		
		db.run(query, values, function(err) {
			if (err) {
				console.log("DATABASE: Error in query (" + err.message + ")");
				if (fail) fail(err);
			}
			else {
				if (success) success();
			}
		});
		
		db.close();
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
	if (!db) {
		if (fail) fail("Could not connect to database");
		return;
	}
	
	db.all("SELECT uuid, safety FROM beacons", function(err, rows) {
		if (err) {
			console.log("DATABASE: Error in query (" + err.message + ")");
			if (fail) fail(err);
		}
		else {
			if (success) success(rows);
		}
	});
	
	db.close();
};

exports.checkBeacon = checkBeacon;
exports.addBeacon = addBeacon;
exports.getBeacon = getBeacon;
exports.setBeacon = setBeacon;
exports.getBeaconList = getBeaconList;