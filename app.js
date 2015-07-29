/*
 * Main BrainGround application file
 *
 */

var express = require('express'),
	app     = express(),
	server  = require('http').createServer(app),
	io      = require('socket.io').listen(server);

// Express directory
app.use(express.static(__dirname + '/public'));

// socket.io functions
/*
 * connection: when new user connect to the application
 * createNote: to create new BrainCard
 * updateNote: update BrainCard
 * moveNote  : move BrainCard
 * deleteNote: delete BrainCard
 */
io.sockets.on('connection', function(socket) {
	console.log("New user connected");
	socket.on('createNote', function(data) {
		console.log("Created note", data);
		socket.broadcast.emit('onNoteCreated', data);
	});

	socket.on('updateNote', function(data) {
		console.log("Updating note", data);
		socket.broadcast.emit('onNoteUpdated', data);
	});

	socket.on('moveNote', function(data){
		console.log("Move note", data);
		socket.broadcast.emit('onNoteMoved', data);
	});

	socket.on('deleteNote', function(data){
		console.log("Delete note", data);
		socket.broadcast.emit('onNoteDeleted', data);
	});
});

server.listen(3000);
console.log("listening on port 3000");