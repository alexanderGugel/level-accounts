var levelup = require('level');
var db = levelup('./test/db');

require('../')(db);

var test = require('tape');

var id;

test('valid signup', function(t) {
    t.plan(5);
    db.accounts.signup('alex', '$ecret', function(error, user) {
        t.equal(error, null);
        id = user.id;
        t.equal(user.hasOwnProperty('id'), true);
        t.equal(user.hasOwnProperty('token'), true);
        t.equal(user.hasOwnProperty('username'), true);
        t.equal(user.username, 'alex');
    });
});

test('invalid signup (duplicate)', function(t) {
    t.plan(2);
    db.accounts.signup('alex', '$ecret', function(error, id) {
        t.equal(error.message, 'Username not available');
        t.equal(id, undefined);
    });
});

var token;

test('valid signin', function(t) {
    t.plan(3);
    db.accounts.signin('alex', '$ecret', function(error, user) {
        t.equal(error, null);
        token = user.token;
        t.equal(user.hasOwnProperty('token'), true);
        delete user.token;
        t.deepEqual(user, {id: id, username: 'alex'});
    });
});

test('invalid signin', function(t) {
    t.plan(2);
    db.accounts.signin('alex', '$nvalid', function(error, user) {
        t.notEqual(error, null);
        t.equal(user, undefined);
    });
});

test('valid auth', function(t) {
    t.plan(2);
    db.accounts.auth(token, function(error, user) {
        t.equal(error, null);
        t.deepEqual(user, {id: id, username: 'alex', token: token});
    });
});

test('invalid auth', function(t) {
    t.plan(2);
    db.accounts.auth('invalid token', function(error, user) {
        t.notEqual(error, null);
        t.equal(user, undefined);
    });
});

test('changeUsername', function(t) {
    t.plan(4);
    db.accounts.changeUsername(id, 'not_alex', function (error, newUser) {
        t.equal(error, null);

        t.deepEqual(newUser, {
            id: id,
            newUsername: 'not_alex',
            oldUsername: 'alex',
            username: 'not_alex'
        });

        db.accounts.signin('not_alex', '$ecret', function (error) {
            t.equal(error, null);
        });
        
        db.accounts.signin('alex', '$ecret', function (error) {
            t.notEqual(error, null);
        });
    });
});

test('changePassword', function(t) {
    t.plan(3);
    db.accounts.changePassword(id, 'geheim', function (error) {
        t.equal(error, null);

        db.accounts.signin('not_alex', 'geheim', function (error) {
            t.equal(error, null);
        });
        
        db.accounts.signin('not_alex', '$ecret', function (error) {
            t.notEqual(error, null);
        });
    });
});

