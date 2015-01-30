var uuid = require('node-uuid');

module.exports = function(username, password, callback) {
    this.db.get(this.prefix + this.usernameToIdPrefix + username, function (error) {
        if (!error) return callback(new Error('Username not available'));
        if (error && !error.message.match(/Key\ not\ found/)) return callback(error);

        var id = uuid.v4();
        var token = uuid.v4();

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
};
