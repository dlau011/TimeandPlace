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
        console.log("connected to server index.js");
        db = conn;
    }
});

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("router.get /");
    res.render('index', {title: 'router.get title'});
});

// called when user clicks Create Poll
router.post('/createpoll', function (req, res) {
    var polldef = {
        pollid: null,
        groupdef: {
            groupname: req.body.groupname,
            groupmembers: [
                {username: req.body.username, userid: 0}
            ]
        },
        postalcode: req.body.postalcode,
        activities: [],
        times: []
    }
    db.collection('polldef').insert(polldef, function (err, res) {
        if (err) {
            console.log("error inserting polldef");
        } else {
            console.log("Inserted a document into the polldef collection.");
        }
    });
    var test = db.collection('polldef').findOne({postalcode: req.body.postalcode}, function (err, response) {
        console.log(response.groupdef);
        res.render('times', null);
    });

});
module.exports = router;
