var _ = require('lodash');
var util = require('./util');

module.exports = function(id, newUsername, callback) {
    if (util.isEmpty(id) || util.isEmpty(newUsername)) return callback(new Error('Id and new username required'));

    callback = _.once(callback);
    
    var username;
    var after = _.after(2, function() {
        this.db.batch()
        .del(this.prefix + this.idToUsernamePrefix + id)
        .put(this.prefix + this.idToUsernamePrefix + id, newUsername)
        .del(this.prefix + this.usernameToIdPrefix + username)
        .put(this.prefix + this.usernameToIdPrefix + newUsername, id)
        .write(function (error) {
            if (error) return callback(error);
            callback(null, {
                username: newUsername,
                oldUsername: username,
                newUsername: newUsername,
                id: id
            });
        });
    }.bind(this));

    this.db.get(this.prefix + this.idToUsernamePrefix + id, function (error, _username) {
        if (error && error.notFound) return callback(new Error('User not found'));
        if (error) return callback(error);

        username = _username;
        after();
    });

    this.db.get(this.prefix + this.usernameToIdPrefix + newUsername, function (error) {
        if (!error) return callback(new Error('New username not available'));
        if (error && !error.notFound) return callback(error);

        after();
    });
};
