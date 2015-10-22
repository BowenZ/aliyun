var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
	HP = require('../models/hp.js'),
    User = HP.User;

/* GET users listing. */
router.get('/user/login', function(req, res, next) {
    User.get(req.query.name, {$exists: true}, req.query.company, function(err, user) {
        if (err) {
            return;
        }
        if (user) {
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.query.password).digest('hex');
            if (user.password != password) {
                res.send(req.query.jsonpcallback + '(' + 2 + ')');
            } else {
            	req.session.user = user;
                res.send(req.query.jsonpcallback + '(' + 1 + ')');
            }
            return;
        } else {
            res.send(req.query.jsonpcallback + '(' + 0 + ')');
            return;
        }
    });
});

router.get('/user/changepwd', function(req, res, next){
	User.changePassword(req.session.user.name, req.query.oldPwd, req.query.newPwd, function(err){
		if(err){
			if(err.message == '0'){
				res.send(req.query.jsonpcallback + '(' + 0 + ')');
			}else{
				console.log(err,'==========');
				res.send(req.query.jsonpcallback + '(' + 2 + ')');
			}
		}else{
			res.send(req.query.jsonpcallback + '(' + 1 + ')');
		}
	});
});

router.get('/question/getquestions', function(req, res, next){

});

module.exports = router;
