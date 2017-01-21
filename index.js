var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/testapp';

var express = require('express');
var app = express();

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log("connected to server");
	
	//db.close();
});


app.get('/', function(req, res) {
	res.send('hello world');
});

app.listen(3000);