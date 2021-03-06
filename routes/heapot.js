var express = require('express');
var router = express.Router();
var xlsx = require('xlsx'),
    fs = require('fs'),
    multer = require('multer'),
    upload = multer({
        dest: '/public/upload/'
    });
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
                // res.send(req.query.callback + '(' + 2 + ')');
                res.jsonp(2);
            } else {
                req.session.user = user;
                res.jsonp(1);
            }
            return;
        } else {
            res.jsonp(0);
            return;
        }
    });
});

router.get('/user/logout', function(req, res, next){
    if(req.session.user){
        req.session.user = null;
    }
    res.json(1);
});

router.get('/user/getsession', function(req, res, next){
    if(!req.session.user){
        return res.send('null');
    }
    res.send(req.session.user);
});

router.get('/user/changepwd', function(req, res, next) {
    if (!req.session.user) {
        return res.send(3);
    }
    User.changePassword(req.session.user._id, req.query.oldPwd, req.query.newPwd, function(err) {
        if (err) {
            if (err.message == '0') {
                res.jsonp(0);
            } else {
                res.jsonp(2);
            }
        } else {
            res.jsonp(1);
        }
    });
});

router.get('/question/getall', function(req, res, next) {
    if (!req.session.user) {
        return res.json(1);
    }
    Question.getAll(function(err, questions) {
        if (err) {
            return res.json(0);
        } else {
            res.json(questions);
        }
    });
});

router.get('/question/user', function(req, res, next) {
    Question.getAll(function(err, docs) {
        if (err){
            console.log(err);
            return res.send('请求超时，请稍后重试');
        }
        var arr = [];
        for (var i = 0; i < 10; i++) {
            arr.push(docs.splice(parseInt(Math.random() * docs.length), 1)[0]);
        }
        // res.json(arr);
        // return;
        res.render('heapot/question/index', {
            questions: arr
        });
    });
});

router.get('/question/admin', function(req, res, next) {
    login = !!req.session.user;
    res.render('heapot/question/admin', {
        title: '答题管理系统',
        login: login
    });
});

router.post('/question/admin/addquestion', function(req, res, next) {
    if (!req.session.user) {
        return res.send('error');
    }
    var newQuestion = new Question({
        type: req.body.type,
        title: req.body.title,
        options: JSON.parse(req.body.options),
        explain: req.body.explain
    });
    newQuestion.save(function(err) {
        if (err)
            res.send('error');
        else
            res.send('success');
        return;
    });
});

router.post('/question/delete', function(req, res, next) {
    if (!req.session.user) {
        return res.json(0);
    }
    Question.deleteOne(req.body.id, function(err) {
        if (err)
            return res.json(0);
        return res.json(1);
    });
});

router.post('/question/deleteall', function(req, res, next) {
    if (!req.session.user) {
        return res.json(0);
    }
    Question.deleteAll(function(err) {
        if (err)
            return res.json(0);
        return res.json(1);
    });
});

function readExcel(file) {
    // 读取xlsx文件，将第一个worksheet转换成json对象
    var workbook = xlsx.readFile(file);
    var sheetNameList = workbook.SheetNames;
    var worksheet = workbook.Sheets[sheetNameList[0]];
    return xlsx.utils.sheet_to_json(worksheet); // 转换为JSON对象数组，第一行数据默认作为对象的key值
}

router.post('/question/admin/upload', upload.single('excelfile'), function(req, res, next) {
    /** When using the "single"
      data come in "req.file" regardless of the attribute "name". **/
    if (req.file == undefined) {
        res.json(0);
        return;
    }
    var tmp_path = req.file.path;

    /** The original name of the uploaded file
        stored in the variable "originalname". **/
    var target_path = 'public/upload/' + req.file.originalname;

    /** A better way to copy the uploaded file. **/
    var src = fs.createReadStream(tmp_path);
    var dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    src.on('end', function() {
        try {
            var results = readExcel(target_path);
            Question.saveAll(results, function(err) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(1);
                }
                return;
            });
        } catch (e) {
            return;
        }
    });
    src.on('error', function(err) {
        res.json(err);
    });
    return;
});

router.get('/question/admin/download', function(req, res, next){
    res.type('application/zip');
    res.download('public/download/download.zip');
});

module.exports = router;
