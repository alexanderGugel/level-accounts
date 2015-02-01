level-accounts
==============

Opinionated, simple and secure token-based authentication solution using LevelDB

Example
-------

```javascript
var db = levelup('./db');
require('level-accounts')(db);

db.accounts.signup('alex', 'pass', function(error, result) {
    console.log(error, result);
});
```

Is it really *that* easy? - There is only one way to find out!

Install
-------

With [npm](https://npmjs.org) do:

```
npm install level-accounts
```

API
---

### `db.accounts.signup(username, password, callback)`

```javascript
db.accounts.signup('alex', 'pass', function(error, result) {
    console.log(error, result);
});
```

should output something like that when successful:

```
null { username: 'alex',
  id: '644ea4b3-f959-4bce-99e3-a1d2768a9984',
  token: '8b06cdea-1eed-421a-b36d-472b93db0b30' }
```

Usernames need to be unique, otherwise error will be set:

```
[Error: Username not available] undefined
```

### `db.accounts.signin(username, password, callback)`

```javascript
db.accounts.signin('alex', 'pass', function(error, result) {
    console.log(error, result);
});
```

Verifies if the given user credentials are valid:

```javascript
null { username: 'alex',
  id: '644ea4b3-f959-4bce-99e3-a1d2768a9984',
  token: '0bd61fac-a6ff-478e-ba0f-d0d131f72568' }
```

Otherwise an error will be set:

```
[Error: Invalid password] undefined
```

### `db.accounts.auth(token, callback)`

```javascript
db.accounts.auth('0bd61fac-a6ff-478e-ba0f-d0d131f72568', function(error, user) {
    console.log(error, user);
});
```

Checks if the given token is valid and returns the associated user object: 

```
null { id: '644ea4b3-f959-4bce-99e3-a1d2768a9984',
  username: 'alex',
  token: '0bd61fac-a6ff-478e-ba0f-d0d131f72568' }
```

Otherwise an error will be set:

```
[Error: Invalid token] undefined
```

### `db.accounts.changePassword(id, newPassword, callback)`

```javascript
db.accounts.changePassword('644ea4b3-f959-4bce-99e3-a1d2768a9984', 'secret new password', function(error, result) {
    console.log(error, result);
});
```

Changes the password associated with the given user id.
Only the id will be returned.

```
null { id: '644ea4b3-f959-4bce-99e3-a1d2768a9984' }
```

### `db.accounts.changeUsername(id, newUsername, callback)`

```javascript
db.accounts.changeUsername('644ea4b3-f959-4bce-99e3-a1d2768a9984', 'alex2', function(error, result) {
    console.log(error, result);
});
```

Changes the user's username to the passed in `newUsername`.
The returned result object also contains new old and new username:

```
null { username: 'alex2',
  oldUsername: 'alex',
  newUsername: 'alex2',
  id: '644ea4b3-f959-4bce-99e3-a1d2768a9984' }
```

Also checks if the new username is available:

```
[Error: New username not available] undefined
```

License
-------

MIT
