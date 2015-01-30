var levelup = require('level');
var db = levelup('./test/db');

require('../')(db);

var test = require('tape');

var id;

test('valid signup', function(t) {
    t.plan(2);
    db.accounts.signup('alex', '$ecret', function(error, user) {
        t.equal(error, null);
        id = user.id;
        t.deepEqual(user, {id: id, username: 'alex', password: '$ecret', tokens: [] });
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
        t.deepEqual(user, {id: id, username: 'alex', password: '$ecret', tokens: []});
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
        t.deepEqual(user, {id: id, username: 'alex', password: '$ecret', tokens: []});
    }); 
});

test('invalid getByUsername', function(t) {
    t.plan(2);
    db.accounts.getByUsername('alex2', function(error, user) {
        t.notEqual(error, null);
        t.equal(user, undefined);
    }); 
});

var token;

test('valid signin', function(t) {
    t.plan(4);
    db.accounts.signin('alex', '$ecret', function(error, user) {
        t.equal(error, null);
        t.equal(user.tokens instanceof Array, true);
        t.equal(user.tokens.length, 1);
        token = user.tokens[0];
        delete user.tokens;
        t.deepEqual(user, {id: id, username: 'alex', password: '$ecret'});
    });
});

test('invalid signin', function(t) {
    t.plan(2);
    db.accounts.signin('alex', '$nvalid', function(error, user) {
        t.notEqual(error, null);
        t.equal(user, undefined);
    });
});

test('valid getByToken', function(t) {
    t.plan(2);
    db.accounts.getByToken(token, function(error, user) {
        t.equal(error, null);
        delete user.tokens;
        t.deepEqual(user, {id: id, username: 'alex', password: '$ecret'});
    });
});

test('invalid getByToken', function(t) {
    t.plan(2);
    db.accounts.getByToken('invalid token', function(error, user) {
        t.notEqual(error, null);
        t.equal(user, undefined);
    });
});

// test('del', function(t) {
//     t.plan(3);
//     db.accounts.del(token, function(error) {
//         t.equal(error, null);

//         db.accounts.del(token, function(error) {
//             t.notEqual(error, null);

//             db.accounts.getByToken(token, function(error) {
//                 t.notEqual(error, null);
//             });
//         });
//     });
// });


test('changeUsername', function(t) {
    t.plan(4);
    db.accounts.changeUsername(token, 'not_alex', function(error, newUser) {
        t.equal(error, null);

        delete newUser.tokens;

        db.accounts.signin('not_alex', '$ecret', function (error, user) {
            t.equal(error, null);
            delete user.tokens;
            t.deepEqual(user, newUser);
        });
        
        db.accounts.signin('alex', '$ecret', function (error) {
            t.notEqual(error, null);
        });
    });
});

