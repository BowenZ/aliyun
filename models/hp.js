var mongodb = require('mongodb').MongoClient;
var settings = require('../settings');
var crypto = require('crypto');


/*--------焕君start---------*/
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
        belong: this.belong
    };

    //open DB
    mongodb.connect(settings.url, function(err, db) {
        if (err) {
            return callback(err);
        }

        //read users collection
        db.collection('users', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }

            //insert user data to users collection
            collection.insert(user, {
                safe: true
            }, function(err, user) {
                db.close();
                callback(null);
            });
        });
    });
};

//read user information
User.get = function(name, email, company, callback) {
    //open DB
    mongodb.connect(settings.url, function(err, db) {
        if (err) {
            return callback(err);
        }

        //read users collection
        db.collection('users', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }

            //query username
            collection.findOne({
                name: name,
                email: email,
                company: company
            }, function(err, user) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user);
            })
        })
    })
}

User.changePassword = function(name, company, oldPwd, newPwd, callback) {
        var aassdd = oldPwd;
        mongodb.connect(settings.url, function(err, db) {
            if (err) {
                return callback(err);
            }
            db.collection('users', function(err, collection) {
                if (err) {
                    db.close();
                    return callback(err);
                }
                collection.findOne({
                    name: name,
                    company: company
                }, function(err, user) {
                    if (err) {
                        return callback(err);
                    }
                    var md5 = crypto.createHash('md5');
                    oldPwd = md5.update(oldPwd).digest('hex');
                    if (user.password != oldPwd) {
                        return callback(new Error('0'));
                    }
                    collection.update({
                        "name": name
                    }, {
                        $set: {
                            password: crypto.createHash('md5').update(newPwd).digest('hex')
                        }
                    }, function(err) {
                        db.close();
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    });
                });

            });
        });
    }
    /*--------焕君end---------*/

/*--------答题start---------*/
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
    mongodb.connect(settings.url, function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('question', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            collection.insert(question, {
                safe: true
            }, function(err, question) {
                db.close();
                callback(null);
            });
        });
    });
};
/*--------答题end---------*/

module.exports = {
    User: User,
    Question: Question
};
