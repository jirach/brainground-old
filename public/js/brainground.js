var app = angular.module('BrainGround', []);

app.directive('brainCard', function(socket) {
	var linker = function(scope, element, attrs, ctrl) {
		console.log("brainCard Linker");
		element.draggable({
			stop: function(event, ui) {
				socket.emit('moveNote', {
					id: scope.note.id,
					x: ui.position.left,
					y: ui.position.top
				});
			}
		});

		socket.on('onNoteMoved', function(data) {
			// Update if the same note
			if(data.id == scope.note.id) {
				element.animate({
					left: data.x,
					top: data.y
				});
			}
		});


		// Some DOM initiation to make it nice
		element.css('left', '20px');
		element.css('top', '60px');
		element.hide().fadeIn();
	};

	var controller = function($scope) {

		// Incoming
		socket.on('onNoteUpdated', function(data) {
			// Update if the same note
			if(data.id == $scope.note.id) {
				$scope.note.title = data.title;
				$scope.note.body = data.body;
			}				
		});

		/*
		// Outgoing
		$scope.updateNote = function(note) {
			console.log("brainCard update", note);
			socket.emit('updateNote', note);
		};

		$scope.deleteNote = function(id) {
			console.log("brainCard delete", id);
			$scope.ondelete({
				id: id
			});
		};
		*/

	};

	return {
		restrict: 'A', //E = element, A = attribute, C = class, M = comment
		link: linker,
		controller: controller,
		scope: {
			//@ reads the attribute value, = provides two-way binding, & works with functions
			"note"    : "=",
			"onChange": '&',
			"ondelete": "&"
		}
	};
});

app.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

app.controller('MainCtrl', function($scope, socket) {
	$scope.notes = [];

	// Incoming
	socket.on('onNoteCreated', function(data) {
		$scope.notes.push(data);
	});

	socket.on('onNoteDeleted', function(data) {
		$scope.handleDeletedNoted(data.id);
	});

	// Outgoing
	$scope.createNote = function() {
		var note = {
			id: new Date().getTime(),
			title: 'New Note',
			body: ''
		};

		$scope.notes.push(note);
		socket.emit('createNote', note);
	};

	$scope.deleteNote = function(id) {
		$scope.handleDeletedNoted(id);

		socket.emit('deleteNote', {id: id});
	};

	$scope.handleDeletedNoted = function(id) {
		var oldNotes = $scope.notes,
		newNotes = [];

		angular.forEach(oldNotes, function(note) {
			if(note.id !== id) newNotes.push(note);
		});

		$scope.notes = newNotes;
	}

	//------------------------------------------------------------------------------------------------

	// Outgoing
	$scope.updateNote = function(note) {
		console.log("brainCard update", note);
		socket.emit('updateNote', note);
	};



});