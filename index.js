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

Accounts.prototype._put = function(user, callback){
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
    return this;
};

Accounts.prototype.put = function(user, callback){
    this.db.get(this.prefix + this.usernamePrefix + user.username, {
        keyEncoding: 'utf8',
        valueEncoding: 'utf8'
    }, function (error) {
        if (!error) return callback(new Error('User already exists'));
        if (!error.message.match(/Key\ not\ found/)) return callback(error);

        // User does not exist
        this._put(user, callback);
    }.bind(this));
    return this;
};

Accounts.prototype._del = function(user, callback){
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
        callback(null);
    });
    return this;
};

Accounts.prototype.del = function(token, callback){
    this.getByToken(token, function(error, user) {
        if (error) return callback(error);

        this._del(user, function(error) {
            if (error) return callback(error);
            callback(null, user);
        });
    }.bind(this));
    return this;
};

Accounts.prototype.signup = function (username, password, callback) {
    if (!_validateUsernamePassword(username, password, callback)) return;
    var user = {id: uuid.v4(), username: username, password: password, tokens: []};
    this.put(user, callback);
    return this;
};

Accounts.prototype.getById = function (id, callback) {
    if (typeof id !== 'string' || id.length === 0) return callback(new Error('Missing id'));
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
    this.getByUsername(username, function(error, user) {
        if (error) return callback(error);
        if (user.password !== password) {
            callback(new Error('Invalid password'));
        } else {
            this._putToken(user, callback);
        }
    }.bind(this));
    return this;
};

Accounts.prototype._putToken = function(user, callback){
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
    return this;
};

Accounts.prototype.getByToken = function (token, callback) {
    if (typeof token !== 'string' || token.length === 0) return callback(new Error('Missing user token'));
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
    // this.getByToken(token, function (error, user) {
    //     if (error && error.message.match(/Invalid\ token/)) return callback(error);
    //     if (error) return callback(error);


    // }.bind(this));
    // this.db.get(this.prefix + this.usernamePrefix + newUsername, {
    //     keyEncoding: 'utf8',
    //     valueEncoding: 'utf8'
    // }, function (error) {
    //     if (!error || !error.message.match(/Key\ not\ found/)) return callback(error);

    //     this.del(token, function (error) {
    //         if (error) return callback(error);

    //         this.put
    //     }.bind(this));
    // }.bind(this));
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
