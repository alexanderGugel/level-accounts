var util = require('./util');

module.exports = function(token, callback) {
    if (util.isEmpty(token)) return callback(new Error('Token required'));
    this.db.get(this.prefix + this.tokenToIdPrefix + token, function (error, id) {
        if (error && error.message.match(/Key\ not\ found/)) return callback(new Error('Invalid token'));
        if (error) return callback(callback);

        this.db.get(this.prefix + this.idToUsernamePrefix + id, function (error, username) {
            if (error) return callback(error);

            callback(null, {
                id: id,
                username: username,
                token: token
            });
        });
    }.bind(this));
};
