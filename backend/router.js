var fs = require("fs");

function route(handle, pathname, response, request) {
	if (typeof(handle[pathname]) === "function") {
		handle[pathname](response, request);
	}
	else if (fs.existsSync("." + pathname)) {
		console.log("Reading ." + pathname + " from file");
		fs.readFile("." + pathname, function (err, html) {
			if (err) {
				response.writeHead(400, {"Content-Type": "text/html"});
				response.write("Could not load index page - " + err.msg);
				response.end(); 
			}       
			else {  
				response.writeHeader(200, {"Content-Type": "text/html"});  
				response.write(html);  
				response.end();  
			}
		});
	}
	else {
		console.log("No request handler found for " + pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found");
		response.end();
	}
}

exports.route = route;