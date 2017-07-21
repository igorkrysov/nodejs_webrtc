var static = require('node-static');
var file = new(static.Server)();

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('private.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here

var httpServer = http.createServer(function (req, res) {
	file.serve(req, res);
});
var httpsServer = https.createServer(credentials, function (req, res) {
	file.serve(req, res);
});

httpServer.listen(1234,"192.168.150.170");
httpsServer.listen(12345,"192.168.150.170");

app.get('/', function (req, res) {
  res.render('index', {});
});

var io = require('socket.io').listen(httpsServer);

io.sockets.on('connection', function (socket) {
	function log() {
		var array = [">>> "];
		for(var i = 0; i < arguments.length; i++) {
			array.push(arguments[i]);
		}
		socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message: ', message);
		socket.broadcast.emit('message', message); // should be room only
	});

	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if(numClients == 0) {
			socket.join(room);
			socket.emit('created', room);
		} 

		else if(numClients == 1) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		} 

		else { // max two clients
			socket.emit('full', room);
		}

		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
	});
});

