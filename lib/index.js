var Accounts = function (db) {
    if (!(this instanceof Accounts)) return new Accounts(db);
    if (db.accounts) throw new Error('level-accounts already added');
    this.db = db;
    db.accounts = this;
    this.prefix = 'accounts:';
    this.idToUsernamePrefix = 'id>username:';
    this.usernameToIdPrefix = 'username>id:';
    this.tokenToIdPrefix = 'token>id:';
    this.idToPasswordPrefix = 'id>password:';
};

Accounts.prototype.auth = require('./auth');
Accounts.prototype.changePassword = require('./changePassword');
Accounts.prototype.changeUsername = require('./changeUsername');
Accounts.prototype.signin = require('./signin');
Accounts.prototype.signup = require('./signup');

module.exports = exports = Accounts;
