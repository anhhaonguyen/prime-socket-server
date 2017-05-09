var WebSocketServer = require('websocket').server;
var http = require('http');

var clients = [];
var port = 8000;
var server = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(port, '0.0.0.0', function() {
	console.log((new Date()) + ' Server is listening on port ' + port);
});

wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

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
	connection.on('message', function(message) {
		if (message.type==='utf8') {
			console.log('Received message: ' + message.utf8Data);
			clients.forEach(function (client) {
				client.send(message.utf8Data);
			});
		} else if (message.type==='binary') {
			console.log('Received binary: ' + message.binaryData.length + ' bytes');
		}
	});
	connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer' + connection.remoteAddress + ' disconnected');
		var index = clients.indexOf(connection);
		clients.splice(index);
	});
});
