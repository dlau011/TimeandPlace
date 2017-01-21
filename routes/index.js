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
function getNextSequenceValue(sequenceName) {
    var sequenceDocument = db.collection('counters').updateOne({
        query:{_id: sequenceName },
        update: {$inc:{sequence_value:1}},
        new:true
    });

    return sequenceDocument.sequence_value;
}
/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("router.get /");
    res.render('index', {title: 'router.get title'});
});

// called when user clicks Create Poll
router.post('/createpoll', function (req, res) {
    var polldef = {
        pollid: getNextSequenceValue('pollid'),
        groupdef: {
            groupname : req.body.groupname,
            groupmembers : [
                {username : req.body.username,  userid: getNextSequenceValue('userid')}
            ]
        },
        postalcode: req.body.postalcode,
        activities: [],
        times: []
    }
    db.collection('polldef').insert(polldef, function(err, res) {
        if (err) {
            console.log("error inserting polldef");
        } else {
            console.log("Inserted a document into the polldef collection.");
        }
    });
});
module.exports = router;
