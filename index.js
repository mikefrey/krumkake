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

  this.cookieName = opt && opt.cookieName || 's'
  this.getOpts = { signed: !!this.keys }
  this.setOpts = {
    domain: opt.domain,
    httpOnly: true,
    signed: !!this.keys,
    overwrite: true
  }

  // Default to 2 hour sessions
  this.expire = opt.expire != null ? opt.expire : 60 * 60 * 2
}

Krumkake.prototype.del = function (key) {
  if (!key) return this.delAll()
  delete this.data[key]
  this._write()
}

Krumkake.prototype.delAll = function (cb) {
  this.data = {}
  this.cookies.set(this.cookieName)
}

Krumkake.prototype.set = function (key, val) {
  var data = this.getAll()

  var kv = {}

  if (val)
    kv[key] = val
  else
    kv = key

  Object.keys(kv).forEach(function(k) {
    data[k] = kv[k]
  })

  this._write()
}

Krumkake.prototype.get = function (key) {
  return this._read()[key]
}

Krumkake.prototype.getAll = function () {
  return this._read()
}

Krumkake.prototype._read = function() {
  if (!this.data) {
    // get existing data
    var data = this.cookies.get(this.cookieName, this.getOpts)
    this.data = data && JSON.parse(data) || {}
    // write the cookie again to set the expires header
    this._write()
  }
  return this.data
}

Krumkake.prototype._write = function() {
  var opts = this.setOpts
  opts.expires = new Date((+new Date) + (this.expire*1000))
  this.cookies.set(this.cookieName, JSON.stringify(this.data), opts)
}
