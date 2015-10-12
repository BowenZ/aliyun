var mongodb = require('mongodb').MongoClient;
var settings = require('../settings');
var crypto = require('crypto');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = {
    User: User
};

//save user information
User.prototype.save = function(callback) {
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
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
User.get = function(name, email, callback) {
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
                email: email
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

User.changePassword = function(name, oldPwd, newPwd, callback) {
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
                name: name
            }, function(err, user) {
                if (err) {
                    return callback(err);
                }
                var md5 = crypto.createHash('md5');
                oldPwd = md5.update(oldPwd).digest('hex');
                if(user.password != oldPwd){
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
