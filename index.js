var uuid = require('node-uuid');

var Accounts = function (db) {
    if (!(this instanceof Accounts)) return new Accounts(db);
    if (db.accounts) throw new Error('level-accounts already added to level!');
    this.db = db;
    db.accounts = this;
    this.prefix = 'accounts:';
    this.userPrefix = 'user:';
    this.usernamePrefix = 'username:';
    this.tokenPrefix = 'token:';
};

Accounts.prototype.createUser = function(user, callback){
    this.db.get(this.prefix + this.usernamePrefix + user.username, {
        keyEncoding: 'utf8',
        valueEncoding: 'utf8'
    }, function (error) {
        if (!error) return callback(new Error('User already exists'));
        if (!error.message.match(/Key\ not\ found/)) return callback(error);

        // User does not exist
        this.db.batch()
        .put(this.prefix + this.usernamePrefix + user.username, user.id, {
            keyEncoding: 'utf8',
            valueEncoding: 'utf8'
        })
        .put(this.prefix + this.userPrefix + user.id, user, {
            keyEncoding: 'utf8',
            valueEncoding: 'json'
        })
        .write(function (error) {
            if (error) return callback(error);
            callback(null, user);
        });
    }.bind(this));
    return this;
};

Accounts.prototype.deleteByToken = function(token, callback){
    this.getByToken(token, function(error, user) {
        if (error) return callback(error);

        this.db.batch()
        .del(this.prefix + this.usernamePrefix + user.username, {
            keyEncoding: 'utf8',
            valueEncoding: 'utf8'
        })
        .del(this.prefix + this.userPrefix + user.id, {
            keyEncoding: 'utf8',
            valueEncoding: 'json'
        })
        .write(function (error) {
            if (error) return callback(error);
            callback(user);
        });
    }.bind(this));
    return this;
};

Accounts.prototype.signup = function (username, password, callback) {
    var user = {id: uuid.v4(), username: username, password: password, tokens: []};
    this.createUser(user, callback);
    return this;
};

Accounts.prototype.getById = function (id, callback) {
    this.db.get(this.prefix + this.userPrefix + id, {
        keyEncoding: 'utf8',
        valueEncoding: 'json'
    }, function(error, user) {
        if (error && error.message.match(/Key\ not\ found/)) return callback(new Error('User does not exist'));
        callback(error, user);
    });
    return this;
};

Accounts.prototype.getByUsername = function (username, callback) {
    this.db.get(this.prefix + this.usernamePrefix + username, {
        keyEncoding: 'utf8',
        valueEncoding: 'utf8'
    }, function(error, id) {
        if (error && error.message.match(/Key\ not\ found/)) return callback(new Error('User does not exist'));
        this.getById(id, callback);
    }.bind(this));
    return this;
};

Accounts.prototype.signin = function (username, password, callback) {
    this.getByUsername(username, function(error, user) {
        if (error) return callback(error);
        if (user.password !== password) {
            callback(new Error('Invalid password'));
        } else {
            var token = uuid.v4();
            user.tokens.push(token);
            this.db.batch()
            .put(this.prefix + this.tokenPrefix + token, user.id, {
                keyEncoding: 'utf8',
                valueEncoding: 'utf8'
            })
            .put(this.prefix + this.userPrefix + user.id, user, {
                keyEncoding: 'utf8',
                valueEncoding: 'json'
            })
            .write(function (error) {
                if (error) return callback(error);
                callback(null, user);
            });
        }
    }.bind(this));
    return this;
};

Accounts.prototype.getByToken = function (token, callback) {
    this.db.get(this.prefix + this.tokenPrefix + token, {
        keyEncoding: 'utf8',
        valueEncoding: 'utf8'
    }, function(error, id) {
        if (error && error.message.match(/Key\ not\ found/)) return callback(new Error('Invalid token'));
        if (error) return callback(error);
        this.getById(id, callback);
    }.bind(this));
    return this;
};

Accounts.prototype.changeUsername = function(token, newUsername, callback){
    // ok, fetch old user
    this.getByToken(token, function (error, user) {
        if (error) return callback(error);

        var oldUsername = user.username;
        user.username = newUsername;
        this.createUser(user, function(error, user) {

            // probably username not available
            if (error) return callback(error);

            // delete old username
            this.db.del(this.prefix + this.usernamePrefix + oldUsername, {
                keyEncoding: 'utf8',
                valueEncoding: 'utf8'
            }, function(error) {
                if (error) return callback(error);

                callback(null, user);
            });
        }.bind(this));
    }.bind(this));
};

Accounts.prototype.changePassword = function(token, newPassword, callback){
    this.getByToken(token, function (error, user) {
        if (error) return callback(error);

        user.password = newPassword;

        this.db.put(this.prefix + this.userPrefix + user.id, user, {
            keyEncoding: 'utf8',
            valueEncoding: 'json'
        }, function (error) {
            if (error) return callback(error);
            callback(null, user);
        }.bind(this));
    }.bind(this));
};




module.exports = Accounts;
