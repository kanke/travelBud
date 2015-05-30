var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {
	"/": requestHandlers.index,
	"/beacon": requestHandlers.beacon,
	"/beaconList": requestHandlers.beaconList
};

server.start(router.route, handle);