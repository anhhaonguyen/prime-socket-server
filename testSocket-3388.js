var WebSocketServer = require('websocket').server;
var http = require('http');
var port = 3388;
var fs = require('fs');

var json = JSON.parse(fs.readFileSync('total.json', 'utf8'));

var clients = [];

var server = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(port,'0.0.0.0', function() {
	console.log((new Date()) + ' Server is listening on port ' + port);
});

wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

// get total & active in localfile
// bind to global var

var total = json.total;
var active = json.active;
console.log('Active: ' + active);
console.log('Total: ' + total);

function originIsAllowed(origin){
	return true;
}

wsServer.on('request', function(request) {
	if(!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected');
		return;
	}
	var connection = request.accept('', request.origin);
	clients.push(connection);

	console.log((new Date()) + ' Connection accepted');

	// increase total & active by 1
	total += 1;
	active += 1;

	console.log('New active: ' + active);
	console.log('New total: ' + total);

	// broadcast to all 
	clients.forEach(function (client) {
		client.send(JSON.stringify({
			"total": total,
			"active": active
		}));
	});

	// save to file

	fs.writeFile('total.json', JSON.stringify({'total': total, 'active': active}), null, 4);

	connection.on('message', function(message) {
		if (message.type==='utf8') {
			console.log('Received message: ' + message.utf8Data);

			var object = JSON.parse(message.utf8Data);
			var dict = {
				"lat": object.lat,
				"lng": object.lng,
				"country_code": object.country_code,
				"country_name": object.country_name,
				"active": active,
				"total": total
			};

			clients.forEach(function (client) {
				client.send(JSON.stringify(dict));
			});
		} else if (message.type==='binary') {
			console.log('Received binary: ' + message.binaryData.length + ' bytes');
		}
	});
	connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer' + connection.remoteAddress + ' disconnected');
		// decrease active by 1
		active -= 1;
		if (active < 0) {
			active = 0;
		}

		console.log('New active: ' + active);
		console.log('New total: ' + total);

		clients.forEach(function (client) {
			client.send(JSON.stringify({
				"total": total,
				"active": active
			}));
		});

		// save to file
		fs.writeFile('total.json', JSON.stringify({'total': total, 'active': active}), null, 4);
	});
});
