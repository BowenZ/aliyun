var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
	HP = require('../models/hp.js'),
    User = HP.User;

/* GET users listing. */
router.get('/huanjun/login', function(req, res, next) {
    console.log('+++++++++++', req.query.name);
    User.get(req.query.name, {
        $exists: true
    }, function(err, user) {
        if (err) {
            return;
        }
        if (user) {
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.query.password).digest('hex');
            if (user.password != password) {
                res.send(req.query.jsonpcallback + '(' + 2 + ')');
            } else {
                res.send(req.query.jsonpcallback + '(' + 1 + ')');
            }
            return;
        } else {
            res.send(req.query.jsonpcallback + '(' + 0 + ')');
            return;
        }
    });
});

module.exports = router;
