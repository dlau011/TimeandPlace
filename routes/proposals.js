/**
 * Use this file for routing times and activities
 */

var express = require('express');
var router = express.Router();
var NodeCache = require('node-cache');
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
// DB Connection
var MongoClient = require('mongodb').MongoClient;
var db = null;
MongoClient.connect('mongodb://localhost:27017/TimeandPlace', function (err, conn) {
    if (err) {
        console.log(err.message);
        throw new Error(err);
    } else {
        db = conn;
    }
});

/* GET time/activities proposals page. */
router.get('/', function (req, res, next) {
    console.log("proposals.get /");
});

router.get('/proposeactivities', function(req, res, next) {

});

router.get('/proposetimes', function(req, res, next) {

});

module.exports = router;
