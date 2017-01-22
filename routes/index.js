var express = require('express');
var router = express.Router();
var NodeCache = require('node-cache');
const myCache = new NodeCache({stdTTL: 100, checkperiod: 120});
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

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("index .get /");
    res.render('index', {title: 'router.get title'});
});

// called when user clicks Create Poll
router.post('/createpoll', function (req, res) {
    console.log('get /createpoll');
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
    db.collection('polldef').insert(polldef, function (err) {
        if (err) {
            console.log("error inserting polldef");
        } else {
            myCache.set('pollid', polldef._id);
        }
    });
    res.render('times', null);
});

router.post('/proposeactivities', function (req, res, next) {
    console.log('get /proposeactivities');
    console.log(req.body);
    var activities = [];
    for (var activity in req.body) {
        activities.push(activity.split('_')[1]);
        var activity = {
            "pollid" : myCache.get('pollid'),
            "votes": [],
            "comments" : [],
            "activitydef" : {
                "name" : "placeholder"
            }
        }
        db.connection('pollactivity').insert(activity);
    }
    db.connection('polldef').updateOne(
        {"_id" : myCache.get('pollid')},
        {$set: {"activities" : activities}}
    );
    res.render('activities', null);
});

router.post('/proposetimes', function (req, res, next) {
    console.log('get /proposetimes');
    console.log(req.body);
    var times = [];
    if (req.body.morning == '1') times.push("Morning");
    if (req.body.afternoon == '1') times.push("Afternoon");
    if (req.body.evening == '1') times.push('Evening');
    if (req.body.night == '1') times.push("Night");
    try {
        db.collection('polldef').updateOne(
            {"_id": myCache.get("pollid")},
            {$set: {"times": times}}
        );
    } catch (e) {
        res.send(e);
    }
    res.render('activities', null);


});

function checkPostal(postcode) {
    var regex = new RegExp(/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i);
    if (regex.test(postcode.value))
        return true;
    else
       return false;
}

module.exports = router;
