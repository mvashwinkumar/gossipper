var url = 'mongodb://219.74.89.237:27017/test';
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var dbserve = {};

dbserve.init = function() {
	console.log('dbService module initialized');
};

// create note
dbserve.insertNote = function(note, callback) {
	MongoClient.connect(url, function(err,db) {
		db.collection('stickynotes').insertOne({
			'id' : note.id,
			'title' : note.title,
			'body' : note.body,
			'top' : note.top,
			'left' : note.left
		}, function(err,result) {
			console.log("Inserted a document into the stickynotes collection.");
			callback(result.ops[0]);
			db.close();
		});
	});
};

// read note
dbserve.getNote = function(id, callback) {
	MongoClient.connect(url, function(err, db) {
	  var cursor =db.collection('stickynotes').find({ "id": id });
	   cursor.each(function(err, result) {
	      callback(result);
	      db.close();
	   });
	});
};

dbserve.getAllNotes = function(callback) {
	console.log('dbserve.getAllNotes called');
	MongoClient.connect(url, function(err, db) {
	  db.collection('stickynotes').find().toArray().then(
	  	function(notes) {
	  		console.dir(notes);
	  		callback(notes);
	  		db.close();
	  	});
	});
}

// update note
dbserve.updateNote = function(note, callback) {
	MongoClient.connect(url, function(err, db) {
		db.collection('stickynotes').findAndModify(
			{id:note.id}, 
			[['id', 1]], 
			{
				$set : {
					title: note.title,
					body: note.body,
					top: note.top,
					left: note.left
				}
			}, 
			{new : true}, 
			function (err, documents) {
	        	console.log(documents);
	        	callback(documents.value);
	        	db.close();
	    });		
	});
};

// delete note
dbserve.deleteNote = function(id, callback) {
	MongoClient.connect(url, function(err, db) {
		db.collection('stickynotes').deleteOne({ "id": id },
	      function(err, result) {
	         callback(result);
	         db.close();
	      });
	});
};

module.exports = dbserve;