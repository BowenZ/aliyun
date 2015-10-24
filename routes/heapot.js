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
    '从这里开始！！！！！！！！！！！！！！！！！！！！！！！！'
    '从这里开始！！！！！！！！！！！！！！！！！！！！！！！！'
    '从这里开始！！！！！！！！！！！！！！！！！！！！！！！！'
    '从这里开始！！！！！！！！！！！！！！！！！！！！！！！！'
    '从这里开始！！！！！！！！！！！！！！！！！！！！！！！！'
    '从这里开始！！！！！！！！！！！！！！！！！！！！！！！！'
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
    var workbook = xlsx.readFile(file);
    var sheetNameList = workbook.SheetNames;
    var worksheet = workbook.Sheets[sheetNameList[0]];
    return xlsx.utils.sheet_to_json(worksheet); // 转换为JSON对象数组，第一行数据默认作为对象的key值
}

router.post('/question/admin/upload', upload.single('excelfile'), function(req, res, next) {
    /** When using the "single"
      data come in "req.file" regardless of the attribute "name". **/
    // console.log(req.file);
    if(req.file == undefined){
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
        try{
            var results = readExcel(target_path);
            Question.saveAll(results, function(err){
                if(err){
                    res.json(err);
                }else{
                    res.json(1);
                }
                return;
            });
        }catch(e){
            console.log(e);
            return;
        }
    });
    src.on('error', function(err) {
        console.log('======');
        console.log(err);
        res.json(err);
    });
    return;
});

module.exports = router;
