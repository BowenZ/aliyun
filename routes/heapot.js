var express = require('express');
var router = express.Router();
var HP = require('../models/hp.js'),
    User = HP.User;

/* GET users listing. */
router.get('/huanjun/login', function(req, res, next) {
    console.log('+++++++++++', req.query.name);
    User.get(req.query.name, {
        $exists: true
    }, function(err, user) {
    	if(err){
    		return;
    	}
        if (user) {
        	console.log(user);
            res.send(req.query.jsonpcallback + '('+1+')');
            return;
        } else {
            res.send(req.query.jsonpcallback + '('+0+')');
            return;
        }
    });
});

module.exports = router;
