var util = require('./util');
var bcrypt = require('bcryptjs');

module.exports = function(id, newPassword, callback) {
    if (util.isEmpty(id) || util.isEmpty(newPassword)) return callback(new Error('Id and new password required'));

    bcrypt.hash(newPassword, 8, function(error, hash) {
        if (error) return callback(error);
        newPassword = hash;

        this.db.batch()
        .del(this.prefix + this.idToPasswordPrefix + id)
        .put(this.prefix + this.idToPasswordPrefix + id, newPassword)
        .write(function(error) {
            if (error) return callback(error);
            callback(null, { id: id });
        });
    }.bind(this));
};
