var wssPort = 3005;
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: wssPort});

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		console.log('Received: %s', message);
		ws.send('got your message ;) ');
	});
	ws.send('hello from server');
});
