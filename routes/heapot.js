var express = require('express');
var router = express.Router();
var xlsx = require('xlsx');
var crypto = require('crypto'),
    HP = require('../models/hp.js'),
    User = HP.User,
    Question = HP.Question;

/* GET users listing. */
router.get('/user/login', function(req, res, next) {
    User.get(req.query.name, {
        $exists: true
    }, req.query.company, function(err, user) {
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

router.get('/user/changepwd', function(req, res, next) {
    User.changePassword(req.session.user.name, req.query.oldPwd, req.query.newPwd, function(err) {
        if (err) {
            if (err.message == '0') {
                res.send(req.query.jsonpcallback + '(' + 0 + ')');
            } else {
                console.log(err, '==========');
                res.send(req.query.jsonpcallback + '(' + 2 + ')');
            }
        } else {
            res.send(req.query.jsonpcallback + '(' + 1 + ')');
        }
    });
});

router.get('/question/getquestions', function(req, res, next) {

});

router.get('/question/admin', function(req, res, next) {
    res.render('heapot/question/admin', {
        title: '答题管理系统'
    });
});

router.post('/question/admin/addquestion', function(req, res, next) {
    var newQuestion = new Question({
        type: req.body.type,
        title: req.body.title,
        options: JSON.parse(req.body.options),
        explain: req.body.explain
    });
    console.log(req.body.options);
    newQuestion.save(function(err) {
        if (err)
            res.send('error');
        else
            res.send('success');
        return;
    });
});

function readExcel(file) {
    // 读取xlsx文件，将第一个worksheet转换成json对象
    var workbook = xlsx.readFile('test.xlsx');
    var sheetNameList = workbook.SheetNames;
    var worksheet = workbook.Sheets[sheetNameList[0]];
    return xlsx.utils.sheet_to_json(worksheet); // 转换为JSON对象数组，第一行数据默认作为对象的key值
}

router.post('/question/admin/upload', function(req, res, next) {
    console.log(req);
    res.send(req);
    return;
    if (!req.files.files || req.files.files.originalFilename == "") {
        console.log('empty file!');
        res.json(0);
        return;
    }
    console.log(req.files);
    res.json(req.files);
    return;
    if (!req.files.files.length) {
        var target_path = './public/images/uploadImgs/' + filesName[0];
        fs.renameSync(req.files.files.path, target_path);
    } else {
        for (var i in req.files.files) {
            var target_path = './public/images/uploadImgs/' + filesName[i];
            if (target_path.indexOf(req.files.files[i].originalFilename.replace(new RegExp(" ", "g"), "-")) < 0) {
                console.log("wrong");
                var originalFilename = req.files.files[i].originalFilename;
                for (var j = 0; j < filesName.length; j++) {
                    if (originalFilename.replace(new RegExp(" ", "g"), "-").indexOf(filesName[j].substring(14)) > -1) {
                        target_path = './public/images/uploadImgs/' + filesName[j];
                        break;
                    }
                }
            }
            fs.renameSync(req.files.files[i].path, target_path);
            console.log(filesName[i] + "-" + req.files.files[i].originalFilename);
        }
    }
    res.json(1);
});

module.exports = router;
