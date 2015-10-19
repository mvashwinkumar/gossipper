var url = 'mongodb://testuser:testpassword@ds041164.mongolab.com:41164/gossipper';
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
var coll;

var dbserve = {};
console.log(url);
dbserve.init = function() {
	console.log('dbService module initialized');
	MongoClient.connect(url, function(err,database) {
		db = database;
		coll = db.collection('stickynotes');
	});
};

// create note
dbserve.insertNote = function(note, callback) {
	coll.insertOne({
		'id' : note.id,
		'title' : note.title,
		'body' : note.body,
		'top' : note.top,
		'left' : note.left
	}, function(err,result) {
		console.log("Inserted a document into the stickynotes collection.");
		callback(result.ops[0]);
	});
	
};

// read note
dbserve.getNote = function(id, callback) {
  var cursor =coll.find({ "id": id });
   cursor.each(function(err, result) {
      callback(result);
   });
	
};

dbserve.getAllNotes = function(callback) {
	coll.find().toArray().then(
	  	function(notes) {
	  		console.dir(notes);
	  		callback(notes);
	});
};

// update note
dbserve.updateNote = function(note, callback) {
	coll.findAndModify(
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
    });		
};

// delete note
dbserve.deleteNote = function(id, callback) {	
	coll.deleteOne({ "id": id },
      function(err, result) {
         callback(result);
    });	
};

module.exports = dbserve;