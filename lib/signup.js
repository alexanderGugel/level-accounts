var uuid = require('node-uuid');
var util = require('./util');
var bcrypt = require('bcryptjs');

module.exports = function(username, password, callback) {
    if (util.isEmpty(username) || util.isEmpty(password)) return callback(new Error('Username and password required'));
    this.db.get(this.prefix + this.usernameToIdPrefix + username, function (error) {
        if (!error) return callback(new Error('Username not available'));
        if (error && !error.message.match(/Key\ not\ found/)) return callback(error);

        var id = uuid.v1();
        var token = uuid.v4();

        bcrypt.hash(password, 8, function(error, hash) {
            if (error) return callback(error);
            password = hash;

            this.db.batch()
            .put(this.prefix + this.idToUsernamePrefix + id, username)
            .put(this.prefix + this.usernameToIdPrefix + username, id)
            .put(this.prefix + this.tokenToIdPrefix + token, id)
            .put(this.prefix + this.idToPasswordPrefix + id, password)
            .write(function(error) {
                if (error) return callback(error);
                callback(null, {
                    username: username,
                    id: id,
                    token: token
                });
            });
        }.bind(this));
    }.bind(this));
};
