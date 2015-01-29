var levelup = require('level');
var db = levelup('./test/db');

require('../')(db);

var test = require('tape');

var id;

test('valid signup', function(t) {
    t.plan(2);
    db.accounts.signup('alex', '$ecret', function(error, _id) {
        t.equal(error, null);
        t.equal(typeof _id, 'string');
        id = _id;
    });
});

test('invalid signup (duplicate)', function(t) {
    t.plan(2);
    db.accounts.signup('alex', '$ecret', function(error, id) {
        t.equal(error.message, 'User already exists');
        t.notOk(id);
    });
});

test('valid getById', function(t) {
    t.plan(2);
    db.accounts.getById(id, function(error, user) {
        t.equal(error, null);
        t.deepEqual(user, {id: id, username: 'alex', password: '$ecret'});
    }); 
});

test('invalid getById', function(t) {
    t.plan(2);
    db.accounts.getById('123', function(error, user) {
        t.notEqual(error, null);
        t.equal(user, undefined);
    }); 
});

test('valid getByUsername', function(t) {
    t.plan(2);
    db.accounts.getByUsername('alex', function(error, user) {
        t.equal(error, null);
        t.deepEqual(user, {id: id, username: 'alex', password: '$ecret'});
    }); 
});

test('invalid getByUsername', function(t) {
    t.plan(2);
    db.accounts.getByUsername('alex2', function(error, user) {
        t.notEqual(error, null);
        t.equal(user, undefined);
    }); 
});



// var token;

// test('valid signin', function(t) {
//     t.plan(2);
//     db.accounts.signin('alex', '$ecret', function(error, _token) {
//         t.notOk(error);
//         t.equal(typeof _token, 'string');
//         token = _token;
//     });
// });

// test('invalid signin', function(t) {
//     t.plan(2);
//     db.accounts.signin('alex', '$nvalid', function(error, _token) {
//         t.notEqual(error, null);
//         t.equal(_token, null);
//     });
// });

// test('valid auth', function(t) {
//     t.plan(2);
//     db.accounts.auth(token, function(error) {
//         t.notOk(error);
//     });
// });

// test('invalid auth', function(t) {
//     t.plan(1);
//     db.accounts.auth('invalid token', function(error) {
//         t.notEqual(error, null);
//     });
// });

