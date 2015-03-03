var bodyParser = require('body-parser');
var express = require('express');
var server = express();
var levelup = require('level');
var db = levelup('./db');

require('../')(db);

server.use(express.static(__dirname + '/public'));

server.use(bodyParser.json());
server.post('/api/users', function(req, res) {
    db.accounts.signup(req.body.username, req.body.password, function(error, user) {
        if (error) {
            res.status(400).send({error: error.message});
        } else {
            res.status(201).send(user);
        }
    });
});

server.post('/api/tokens', function(req, res) {
    db.accounts.signin(req.body.username, req.body.password, function(error, user) {
        if (error) {
            res.status(400).send({error: error.message});
        } else {
            res.status(201).send(user);
        }
    });
});

server.get('/api/tokens/:token', function(req, res) {
    db.accounts.auth(req.params.token, function(error, user) {
        if (error) {
            res.status(404).send({error: error.message});
        } else {
            res.send(user);
        }
    });
});


var port = process.env.PORT || 1337;

server.listen(port, function() {
    console.log('Server listening on port ' + port);
});
