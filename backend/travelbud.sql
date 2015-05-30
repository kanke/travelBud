DROP TABLE IF EXISTS beacons;
CREATE TABLE beacons (
	id INTEGER PRIMARY KEY,
	uuid VARCHAR(48) NOT NULL
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

INSERT INTO beacons (id, uuid) VALUES 
	(1, "1E9E354C-F44D-4B08-ABBF-40014FE9CC26"),
	(2, "F890A9E5-EA2D-4B0F-972B-922F625F72DC");

INSERT INTO stations (id, transport, code) VALUES
	(1, "bus", "490007960R"),
	(2, "bus", "490004996U"),
	(3, "airport", "");

INSERT INTO beacons_stations (beacon_id, station_id, platform) VALUES
	(1, 1, NULL),
	(2, 3, NULL);