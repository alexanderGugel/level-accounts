var uuid = require('node-uuid');

var Accounts = function (db) {
    if (!(this instanceof Accounts)) return new Accounts(db);
    if (db.accounts) throw new Error('level-accounts already added to level!');
    this.db = db;
    db.accounts = this;
    this.prefix = 'accounts:';
    this.userPrefix = 'user:';
    this.usernamePrefix = 'username:';
};

Accounts.prototype.signup = function (username, password, callback) {
    if (!_validateUsernamePassword(username, password, callback)) return;
    this.db.get(this.prefix + this.usernamePrefix + username, {
        keyEncoding: 'utf8'
    }, function (error) {
        if (!error) return callback(new Error('User already exists'));
        if (!error.message.match(/Key\ not\ found/)) return callback(error);

        var id = uuid.v4();
        var user = {id: id, username: username, password: password};

        // User does not exist
        this.db.batch()
        .put(this.prefix + this.usernamePrefix + username, id, {
            keyEncoding: 'utf8',
            valueEncoding: 'utf8'
        })
        .put(this.prefix + this.userPrefix + id, user, {
            keyEncoding: 'utf8',
            valueEncoding: 'json'
        })
        .write(function (error) {
            if (error) return callback(error);
            callback(null, id);
        });
    }.bind(this));
    return this;
};

Accounts.prototype.getById = function (id, callback) {
    if (typeof id !== 'string' || id.length === 0) return callback(new Error('Missing user id'));
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
    if (typeof username !== 'string' || username.length === 0) return callback(new Error('Missing username'));
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
    if (!_validateUsernamePassword(username, password, callback)) return;
};

Accounts.prototype.auth = function (token, callback) {
};

function _validateUsernamePassword(username, password, callback) {
    if (
        typeof username !== 'string' || typeof password !== 'string' ||
        username.length === 0 || password.length === 1
    ) {
        callback(new Error('Missing username or password'));
        return false;
    }
    return true;
}

module.exports = Accounts;
