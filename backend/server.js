var http = require("http");
var url = require("url");
var config = require("config");

function start(route, handle) {
	
	var port = 8888;
	
	var serverConfig = config.Server;
	if (serverConfig.port)
		port = serverConfig.port;
	
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received");
		route(handle, pathname, response, request);
	}
	
	http.createServer(onRequest).listen(port);
	console.log("Server has started, listening on port " + port);
}

exports.start = start;