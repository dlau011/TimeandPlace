
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var NodeCache = require('node-cache');
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();
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
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// all POST calls go through here
app.post('/', function (req, res) {
    console.log('app.post //n' + req.body);
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



module.exports = app;


