DROP TABLE IF EXISTS beacons;
CREATE TABLE beacons (
	id INTEGER PRIMARY KEY,
	uuid VARCHAR(48) UNIQUE NOT NULL,
	safety TEXT DEFAULT ""
);

DROP TABLE IF EXISTS stations;
CREATE TABLE stations (
	id INTEGER PRIMARY KEY,
	transport VARCHAR(255) NOT NULL,
	code VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS beacons_stations;
CREATE TABLE beacons_stations (
	beacon_id INTEGER,
	station_id INTEGER,
	platform VARCHAR(255)
);

INSERT INTO beacons (id, uuid, safety) VALUES 
	(1, "1E9E354C-F44D-4B08-ABBF-40014FE9CC26", "Roadworks 20m north of bus stop"),
	(2, "F890A9E5-EA2D-4B0F-972B-922F625F72DC", "Security barrier set up left of beacon"),
	(3, "C48C6716-193F-477B-B73A-C550CE582A22", "Pavement dug up 10m south of bus stop");

INSERT INTO stations (id, transport, code) VALUES
	(1, "bus", "490007960R"),
	(2, "bus", "490004996U"),
	(3, "airport", "LHR");

INSERT INTO beacons_stations (beacon_id, station_id, platform) VALUES
	(1, 1, NULL),
	(2, 3, "A20"),
	(3, 2, NULL);