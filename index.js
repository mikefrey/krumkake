module.exports = Krumkake

var Cookies = require('cookies')

// optional dependency
try { var KeyGrip = require('keygrip') } catch (e) {}

function Krumkake (req, res, opt) {
  opt = opt || {}

  // if we got an array of strings rather than a keygrip, then
  // keygrip it up.
  if (opt.keys) {
    if (!KeyGrip)
      throw new Error('keys provided by KeyGrip not available')
    else if (Array.isArray(opt.keys))
      this.keys = new KeyGrip(opt.keys)
    else if (opt.keys instanceof KeyGrip)
      this.keys = opt.keys
    else
      throw new Error('invalid keys provided')
  }

  // set up the cookies module
  this.cookies = opt.cookies || new Cookies(req, res, this.keys)

  this.name = opt && opt.cookieName || 's'
  this.cookieOpts = { signed: !!this.keys }

  // Default to 2 hour sessions
  this.expire = opt.expire || 1000 * 60 * 60 * 2
}

Krumkake.prototype.del = function (key) {
  delete this.data[key]
  this._write()
}

Krumkake.prototype.delAll = function (cb) {
  this.cookies.set(this.cookieName)
}

Krumkake.prototype.set = function (key, val) {
  var kv = {}

  if (val)
    kv[key] = val
  else
    kv = key

  Object.keys(kv).forEach(function(k) {
    this.data[k] = obj[key]
  })

  this._write()
}

Krumkake.prototype.get = function (key) {
  return this.data[key]
}

Krumkake.prototype.getAll = function () {
  return this.data
}

krumkake.prototype._read = function() {
  if (!this.data) {
    // get existing data
    var data = this.cookies.get(this.cookieName, this.cookieOpts)
    this.data = data && JSON.parse(data) || {}
    // write the cookie again to set the expires header
    this._write()
  }
  return this.data
}

krumkake.prototype._write = function() {
  var opts = this.cookieOpts
  opts.expires = new Date((+new Date) + this.expires)
  this.cookies.set(this.cookiteName, JSON.stringify(this.data), opts)
}
