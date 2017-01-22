/**
 * Created by MatthewHu on 2017-01-21.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('linksharing', {url: 'actullayurl'});
});

module.exports = router;
