module.exports = function(id, newPassword, callback) {
    this.db.batch()
    .del(this.prefix + this.idToPasswordPrefix + id)
    .put(this.prefix + this.idToPasswordPrefix + id, newPassword)
    .write(function(error) {
        if (error) return callback(error);
        callback(null);
    });
};
