var express = require('express');
var router = express.Router();
// DB Connection
var MongoClient = require('mongodb').MongoClient;
var db = null;
MongoClient.connect('mongodb://localhost:27017/timeandplacedb', function (err, conn) {
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
    var results = getpollcollection("1", "polldef", function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        //console.log(result);
        res.render("index", {title: "Your UsrID is " + result.pollid});
    });
});

function getpollcollection(pollid, table, callback) {
    db.collection(table).findOne({pollid:pollid}, function (err, result) {
        if (err) {
            console.log(err.message);
            throw new Error(err);
        }
        console.log(result);
        callback(null, result);
    });
}

module.exports = router;
