express-monogo-rs-session
=========================

Express 4, MongoDB replica set session driver.

Wrote this because I couldn't find a driver that worked against mongoose/monog in the way I needed.

Installing
==========

```js
npm install express-monogo-rs-session
```

Using
=====

```js
var expressSession = require('express-session');
var mongoSession = require('express-monogo-rs-session')(expressSession);

var app = express();
app.use(expressSession({
        store: new MongoSession(),
        secret: 'password',
        name: 'name'
    }));
```
