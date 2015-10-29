var settings = require('../settings');
var crypto = require('crypto'),
    ObjectID = require('mongodb').ObjectID;
// var mongodb = require('mongodb').MongoClient;
var mongoose = require('mongoose');
mongoose.connect(settings.url);

//--------user start---------
var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: String,
    tel: String,
    company: String
}, {
    collection: 'users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.tel = user.tel;
    this.company = user.company;
}

//save user information
User.prototype.save = function(callback) {
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        tel: this.tel,
        company: this.company
    };

    var newUser = new userModel(user);

    newUser.save(function(err, user) {
        return callback(err, user);
    });
};

//read user information
User.get = function(name, email, company, callback) {
    if (name == 'administrator') {
        userModel.findOne({
            name: name
        }, function(err, user) {
            if (err) {
                return callback(err);
            }
            callback(null, user);
        });
        return;
    }
    userModel.findOne({
        name: name,
        email: email,
        company: company
    }, function(err, user) {
        return callback(err, user);
    });
}

User.changePassword = function(id, oldPwd, newPwd, callback) {
    var aassdd = oldPwd;
    userModel.findOne({
        _id: new ObjectID(id)
    }, function(err, user) {
        if (err) {
            return callback(err);
        }
        var md5 = crypto.createHash('md5');
        oldPwd = md5.update(oldPwd).digest('hex');
        if (user.password != oldPwd) {
            return callback(new Error('0'));
        }
        userModel.update({
            _id: new ObjectID(id)
        }, {
            $set: {
                password: crypto.createHash('md5').update(newPwd).digest('hex')
            }
        }, function(err) {
            callback(err);
        });
    });
}

//--------user end---------

//--------答题start---------
var questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['radio', 'checkbox'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    options: {
        type: [{
            option: String,
            checked: Boolean
        }],
        required: true
    },
    explain: String,
    time: {
        date: Date,
        year: Number,
        month: String,
        day: String,
        minute: String
    }
}, {
    collection: 'question'
});

var questionModel = mongoose.model('Question', questionSchema);

function Question(question) {
    this.type = question.type;
    this.title = question.title;
    this.options = question.options;
    this.explain = question.explain;
}

Question.prototype.save = function(callback) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    };
    var question = {
        type: this.type,
        title: this.title,
        options: this.options,
        explain: this.explain,
        time: time
    }

    var newQuestion = new questionModel(question);
    newQuestion.save(function(err, question) {
        callback(err, question);
    });
};

Question.getAll = function(callback) {
    questionModel.find({}).sort('-time').exec(function(err, docs) {
        callback(err, docs);
    });
}

Question.deleteOne = function(id, callback) {
    questionModel.remove({
        _id: new ObjectID(id)
    }, function(err) {
        callback(err);
    });
}

Question.deleteAll = function(callback) {
    questionModel.remove({}, function(err) {
        callback(err);
    });
}

Question.saveAll = function(arr, callback) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    };
    var questions = [],
        tmpOptions, tmpAnswer, tmpIndex;
    arr.forEach(function(item, index) {
        if (item.type == 0) {
            tmpOptions = [];
            item.options.split(/;/).forEach(function(opt, index) {
                tmpOptions.push({
                    option: opt,
                    checked: index == (item.answer - 1)
                });
            })
        } else {
            tmpOptions = [], tmpAnswer = item.answer.split(/;/), tmpIndex = tmpAnswer.shift();
            item.options.split(/;/).forEach(function(opt, index) {
                if (index == (tmpIndex - 1)) {
                    tmpOptions.push({
                        option: opt,
                        checked: true
                    });
                    tmpIndex = tmpAnswer.shift();
                } else {
                    tmpOptions.push({
                        option: opt,
                        checked: false
                    });
                }
            })
        }
        questions.push({
            type: item.type == 0 ? 'radio' : 'checkbox',
            title: item.title,
            options: tmpOptions,
            explain: item.explain,
            time: time
        });
    });
    questionModel.create(questions, function(err, docs) {
        callback(err);
    });
}

//--------答题end---------

module.exports = {
    User: User,
    Question: Question
};
