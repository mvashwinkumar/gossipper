var stickyNotesApp = angular.module('StickyNotesApp',[]);

stickyNotesApp.controller('StickyNotesCtrl',['$scope','StickyNotesSocket', function($scope, StickyNotesSocket) {
	$scope.notes = [];
	// create Note
	StickyNotesSocket.on('onNoteCreated', function(data) {
		$scope.notes.push(data);
	});
	$scope.createNote = function() {
		var note = {
			id : new Date().getTime(),
			title: 'New Note',
			body: 'Pending'
		};

		$scope.notes.push(note);
		StickyNotesSocket.emit('createNote', note);
	};

	//delete Note
	StickyNotesSocket.on('onNoteDeleted', function(data) {		
		$scope.handleDeletedNoted(data.id);
	});
	$scope.deleteNote = function(id) {
		$scope.handleDeletedNoted(id);
		StickyNotesSocket.emit('deleteNote', {'id':id});
	};
	$scope.handleDeletedNoted = function(id) {
		var oldNotes = $scope.notes,
		newNotes = [];

		angular.forEach(oldNotes, function(note) {
			if(note.id !== id) newNotes.push(note);
		});

		$scope.notes = newNotes;
	};

	//update Note
	$scope.updateNote = function(note) {
		console.log('updateNote called');
		StickyNotesSocket.emit('updateNote', note);
	};

	StickyNotesSocket.on('onNoteUpdated', function(data) {
		angular.forEach($scope.notes, function(note) {
			if(note.id == data.id) {
				note.title = data.title;
				note.body = data.body;
			}
		});
	});
}]);

stickyNotesApp.factory('StickyNotesSocket',  ['$rootScope', function($rootScope) {
	var socket = io();
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
}]);

stickyNotesApp.directive('stickyNote',['StickyNotesSocket', function(StickyNotesSocket) {
	
	var linker = function(scope,element,attrs) {

        element.draggable({
        	stop: function(event,ui) {
        		console.log('draggable called');
        		StickyNotesSocket.emit('moveNote', {
        			id: scope.note.id,
	        		x: ui.position.left,
	        		y: ui.position.top
        		});        		
        	}
        });

        StickyNotesSocket.on('onNoteMoved', function(data) {
        	if(data.id == scope.note.id) {
        		element.animate({
        			left: data.x,
        			top: data.y
        		});
        	}
        });

        element.css('left: 10px');
        element.css('top: 50px');
        element.hide().fadeIn();
	};

	return {
		restrict: 'A',
		link: linker,
		scope: {
			note: '='
		}
	};
}]);