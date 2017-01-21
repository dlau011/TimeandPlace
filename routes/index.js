var express = require('express');
var router = express.Router();
// DB Connection
var MongoClient = require('mongodb').MongoClient;
var db = null;
MongoClient.connect('mongodb://localhost:27017/TimeandPlace', function (err, conn) {
    if (err) {
        console.log(err.message);
        throw new Error(err);
    } else {
        console.log("connected to server");
        db = conn;
    }
});

/* GET home page. */
router.get('/', function (req, res, next) {

    db.collection('userdef').findOne({name:'Denise'}, function (err, result) {
        console.log(result);
        res.render('index', {title: 'Your UserID is ' + result.userid});
    });

});

module.exports = router;
