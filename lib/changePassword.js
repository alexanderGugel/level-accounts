var util = require('./util');

module.exports = function(id, newPassword, callback) {
    if (util.isEmpty(id) || util.isEmpty(newPassword)) return callback(new Error('Id and new password required'));
    this.db.batch()
    .del(this.prefix + this.idToPasswordPrefix + id)
    .put(this.prefix + this.idToPasswordPrefix + id, newPassword)
    .write(function(error) {
        if (error) return callback(error);
        callback(null);
    });
};
