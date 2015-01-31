var util = require('../lib/util');
var test = require('tape');

test('util', function(t) {
    t.test('isEmpty method', function(t) {
        t.ok(util.isEmpty instanceof Function);
        t.ok(util.isEmpty(''));
        t.ok(util.isEmpty());
        t.ok(util.isEmpty(null));
        t.ok(util.isEmpty(null));
        t.notOk(util.isEmpty('not empty'));
        t.notOk(util.isEmpty('t'));
        t.notOk(util.isEmpty('test'));
        t.end();
    });
});
