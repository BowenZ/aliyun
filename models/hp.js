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
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';
    //user's file that about to save to DB
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };

    //open DB
    mongodb.connect(settings.url, function (err, db) {
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
    mongodb.connect(settings.url, function (err, db) {
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
