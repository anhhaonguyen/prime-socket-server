var wssPort = 3005;
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: wssPort});

console.log('Starting wss on port: %d', wssPort);
wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		console.log('Received: %s', message);
		ws.send('got your message ;) ');
		console.log('start broadcasting');
		wss.broadcast(message);
	});
	ws.send('hello from server');
});

wss.broadcast = function broadcast(data) {
	console.log('Start broadcasting');
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};
