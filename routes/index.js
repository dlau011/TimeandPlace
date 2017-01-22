
var express = require('express');
var router = express.Router();
var NodeCache = require('node-cache');
//var yelp = require('node-yelp');

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

// returns next sequence number in db
function getNextSequence(name) {
    var result = db.collection('counters').updateOne(
        {"_id" : name},
        { $inc: { sequence_value: 1 }}
    );

    return result.sequence_value;
}
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
                {username: req.body.username, userid: getNextSequence('userid')}
            ]
        },
        postalcode: req.body.postalcode,
        activities: [],
        times: []
    }
    console.log("userid: " + polldef.groupdef.groupmembers)
    db.collection('polldef').insert(polldef, function (err) {
        if (err) {
            console.log("error inserting polldef");
        } else {
            myCache.set('pollid', polldef._id);
        }

    });

    res.render('times', null);
});
// do get when user wants new page?
// do post when user clicks on any data and commit it to db?

// called when user goes to propose activities
router.post('/proposeactivities', function (req, res, next) {
    console.log('post /proposeactivities');
    console.log(req.body);
    //db.collection('polldef').findOne({"_id" : myCache.get('pollid')}, function (err, poll){


    db.collection('polldef').updateOne(

        {"_id" : myCache.get('pollid')},
        {$set: {"activities" : "placeholder"}}
    );
    //res.render('activities', null);
});

// called when user clicks on an activity to propose. Adds it to polldef.activities
router.post('/proposeactivities/:activityid', function (req, res, next) {
    console.log('post /proposeactivities/:activityid');
    console.log(req.body);
    var activityid = req.params.activityid;
    // add this activity to polldef.activities
    db.collection('polldef').update(
        {"pollid": myCache.get("pollid")},
        {$push: {"activities" : activityid}});

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

function get_poll_collection(pollid, table, callback) {
    db.collection(table).findOne({pollid:pollid}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        console.log(result);
        callback(null, result);
    });
}

function add_poll_user(pollid, username) {
    db.collection("polldef").findOne({pollid:pollid}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        var user_list = new Array();
        user_list = result.groupdef.groupmembers;
        for (user in user_list) {
            if (user_list[user] == username) {
                callback(null, False);
            }
        }

        user_list.push({"username":username, "userid": (parseInt(user_list[user_list.length - 1].userid) + 1).toString()});
        result.groupdef["groupmembers"] = user_list;

        db.collection("polldef").updateOne({pollid:pollid}, {$set:result}, function (err, result) {
            if (err) {
                console.log(err.message);
                throw new Error(err);
            }
        });
        callback(null, True);
    });
}

function add_poll_time(poll_time) {
    db.collection("polltime").insertOne(poll_time, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        update_poll_times(poll_time.pollid, poll_time.time);
    });
}

function update_poll_times(pollid, time) {
    console.log(pollid);
    db.collection("polldef").findOne({pollid:pollid}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        console.log(result);
        var time_list = new Array();
        time_list = result.times;
        time_list.push(time);
        result.time = time_list;

        db.collection("polldef").updateOne({pollid:pollid}, {$set:result}, function (err, result) {
            if (err) {
                console.log(err.message);
                throw new Error(err);
            }
        });
        //callback(null, True);
    });
}

function add_time_comment(pollid, time,username, comment) {
    db.collection("polltime").findOne({pollid:pollid, time:time}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        var time_list = new Array();
        time_list = result.comments;
        time_list.push({"username":username, "Comment": comment, "timestamp" : "now"});
        result.comments = time_list;

        db.collection("polltime").updateOne({pollid:pollid, time:time}, {$set:result}, function (err, result) {
            if (err) {
                console.log(err.message);
                throw new Error(err);
            }
        });
        //callback(null, True);
    });
}

function add_activity_comment(id,username, comment) {
    db.collection("pollactivity").findOne({activityid:id}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        console.log(result);
        var activity_list = new Array();
        activity_list = result.comments;
        activity_list.push({"username":username, "Comment": comment, "timestamp" : "now"});
        result.comments = activity_list;

        db.collection("pollactivity").updateOne({activityid:id}, {$set:result}, function (err, result) {
            if (err) {
                console.log(err.message);
                throw new Error(err);
            }
        });
        //callback(null, True);
    });
}

function set_time_vote(pollid, time, username, add_flag) {
    db.collection("polltime").findOne({pollid:pollid, time:time}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        var time_list = new Array();
        time_list = result.votes;
        if (add_flag == 1) {
            time_list.push(username);
        } else {
            time_list.pop(username);
        }
        result.votes = time_list;

        db.collection("polltime").updateOne({pollid:pollid, time:time}, {$set:result}, function (err, result) {
            if (err) {
                console.log(err.message);
                throw new Error(err);
            }
        });
        //callback(null, True);
    });
}

function set_activity_vote (id,username, add_flag) {
    db.collection("pollactivity").findOne({activityid:id}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        console.log(result);
        var activity_list = new Array();
        activity_list = result.votes;
        if (add_flag == 1) {
            activity_list.push(username);
        } else {
            activity_list.pop(username);
        }
        result.votes = activity_list;

        db.collection("pollactivity").updateOne({activityid:id}, {$set:result}, function (err, result) {
            if (err) {
                console.log(err.message);
                throw new Error(err);
            }
        });
        //callback(null, True);
    });
}
