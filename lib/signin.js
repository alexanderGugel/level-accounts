var uuid = require('node-uuid');

module.exports = function(username, password, callback) {
    this.db.get(this.prefix + this.usernameToIdPrefix + username, function (error, id) {
        if (error && error.message.match(/Key\ not\ found/)) return callback(new Error('Invalid username'));
        if (error) return callback(error);

        this.db.get(this.prefix + this.idToPasswordPrefix + id, function (error, realPassword) {
            if (error) return callback(error);

            if (password !== realPassword) return callback('Invalid password');

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
};
