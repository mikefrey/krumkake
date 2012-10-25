# krumkake

Cookie based sessions for node.js.

More than likely, it is a bad idea to use this module, unless you know for
sure that you are not going to store any sensitive information in the cookie.

## Still here?

Here's how to use it:

```javascript
var Krumkake = require('krumkake'),
var http = require('http')

http.createServer(function(req, res) {
  var session = new Krumkake(req, res, {
    cookieName: 's', // defaults to 's'
    expire: 60 * 60 * 2, // time in seconds, default 2 hours
    keys: ['secret','keys']
  })

  // read session data with `get`
  var val = session.get('some-key')

  if (!val) {
    // write session data with `set`
    session.set('some-key', 'my data')
    session.key('complex', { more: 'data' })
  }

  // remove data with `del`
  session.del('complex')
}).listen(1337)
```

## API

### session = new Krumkake(req, res, [options])

Initialize a new instance with the server request and response objects, and an
optional `options` object. `options` accepts the following properties:

* `cookieName` {String} Name to use for the cookie
* `expire` {Number} Time in seconds until the session expires (default 2 hours)
* `keys` {[Keygrip](https://github.com/jed/keygrip)} A Keygrip instance used to
  sign the session cookie
* `keys` {Array} An array of keys used to create a Keygrip instance
* `cookies` {[Cookies](https://github.com/jed/cookies)} A Cookies instance to
  use to store the session cookie

### session.get(key)

Gets the data with the given key from the session cookie.

### session.getAll()

Gets all data from the session cookie as a hash.

### session.set(key, value)

Sets the given key-value pair on the session cookie.

If `key` is an object, the key-value pairs of the object will be written to the
session cookie.

### session.del([key])

Removes the key-value pair with the given key from the session cookie. If `key`
is omitted, all keys are removed and the session cookie is expired immediately.

### session.delAll()

Removes all keys from the session cookie and expires the cookie immediately.
