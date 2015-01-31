var uuid = require('node-uuid');
var util = require('./util');
var bcrypt = require('bcryptjs');

module.exports = function(username, password, callback) {
    if (util.isEmpty(username) || util.isEmpty(password)) return callback(new Error('Username and password required'));
    this.db.get(this.prefix + this.usernameToIdPrefix + username, function (error, id) {
        if (error && error.message.match(/Key\ not\ found/)) return callback(new Error('Invalid username'));
        if (error) return callback(error);

        this.db.get(this.prefix + this.idToPasswordPrefix + id, function (error, realPassword) {
            if (error) return callback(error);
    
            bcrypt.compare(password, realPassword, function(error, valid) {
                if (error) return callback(error);
                if (!valid) return callback(new Error('Invalid password'));

                var token = uuid.v4();
                this.db.put(this.prefix + this.tokenToIdPrefix + token, id, function(error) {
                    if (error) return callback(error);
                    callback(null, {
                        username: username,
                        id: id,
                        token: token
                    });
                });
            }.bind(this));
        }.bind(this));
    }.bind(this));
};
