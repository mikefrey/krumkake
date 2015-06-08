var assert = require('assert')
var sinon = require('sinon')
var Krumkake = require('../')
var cookies

describe('Session', function() {

  beforeEach(function(done) {
    cookies = {
      set: sinon.spy(),
      get: sinon.spy(),
    }
    done()
  })

  describe('Initialization', function() {

    it('should set default cookie name', function(done) {
      var krumkake = new Krumkake(null, null, { cookies:cookies })
      assert.equal(krumkake.cookieName, 's')
      done()
    })

    it('should set custom cookie name', function(done) {
      var krumkake = new Krumkake(null, null, { cookies:cookies, cookieName:'custom' })
      assert.equal(krumkake.cookieName, 'custom')
      done()
    })

    it('should set options as not signed', function(done) {
      var krumkake = new Krumkake(null, null, { cookies:cookies })
      assert.equal(krumkake.getOpts.signed, false)
      assert.equal(krumkake.setOpts.signed, false)
      done()
    })

    it('should set options as signed', function(done) {
      var krumkake = new Krumkake(null, null, { cookies:cookies, keys:['a','b'] })
      assert.equal(krumkake.getOpts.signed, true)
      assert.equal(krumkake.setOpts.signed, true)
      done()
    })

    it('should set default expiration', function(done) {
      var krumkake = new Krumkake(null, null, { cookies:cookies })
      assert.equal(krumkake.expire, 60*60*2)
      done()
    })

    it('should set custom expiration', function(done) {
      var krumkake = new Krumkake(null, null, { cookies:cookies, expire:8675309 })
      assert.equal(krumkake.expire, 8675309)
      done()
    })

    it('should set custom domain', function(done) {
      var krumkake = new Krumkake(null, null, { cookies:cookies, domain:'.example.com' })
      assert.equal(krumkake.setOpts.domain, '.example.com')
      done()
    })

  })

  describe('Set', function() {
    var krumkake

    beforeEach(function(done) {
      krumkake = new Krumkake(null, null, { cookies:cookies, domain:'.example.com' })
      done()
    })

    it('should set simple key-value pair', function(done) {
      krumkake.set('foo', 'bar')
      assert.equal(krumkake.data['foo'], 'bar')
      // console.log(cookies.set.getCall(0).args)
      assert(cookies.set.calledWith('s', encodeURIComponent('{"foo":"bar"}')))
      done()
    })

    it('should set simple key-value pairs', function(done) {
      krumkake.set({'foo':'bar', 'baz':'foo'})
      assert.equal(krumkake.data['foo'], 'bar')
      assert.equal(krumkake.data['baz'], 'foo')
      assert(cookies.set.calledWith('s', encodeURIComponent('{"foo":"bar","baz":"foo"}')))
      done()
    })

    it('should set complex values', function(done) {
      var key = 'foo'
      var val = { bar:'baz' }
      krumkake.set(key, val)
      assert.strictEqual(krumkake.data[key], val)
      assert(cookies.set.calledWith('s', encodeURIComponent('{"foo":{"bar":"baz"}}')))
      done()
    })

    it('should set with custom domain', function(done) {
      krumkake.set('foo', { bar:'baz' })
      var call = cookies.set.getCall(0)
      assert.strictEqual(call.args[2].domain, '.example.com')
      done()
    })

  })

  describe('Get', function() {
    var krumkake

    beforeEach(function(done) {
      cookies.get = sinon.spy(function(){
        return '{"foo":{"bar":"baz"},"one":1,"two":2}'
      })
      krumkake = new Krumkake(null, null, { cookies:cookies })
      done()
    })

    it('should get key-value pair', function(done) {
      var val = krumkake.get('foo')
      assert(val)
      assert.equal(val.bar, 'baz')
      assert(cookies.get.calledWith('s'))
      done()
    })

    it('should update expire on read', function(done) {
      var val = krumkake.get('foo')
      cookies.set.calledWithMatch(sinon.match.string, sinon.match.string, function(val){
        return typeof val === 'object' && Object.prototype.toString.call(val.expire) == '[object Date]'
      })
      assert(val)
      assert.equal(val.bar, 'baz')
      assert(cookies.get.calledWith('s'))
      done()
    })

  })

  describe('Get All', function() {
    var krumkake

    beforeEach(function(done) {
      cookies.get = sinon.spy(function(){
        return '{"foo":{"bar":"baz"},"one":1,"two":2}'
      })
      krumkake = new Krumkake(null, null, { cookies:cookies })
      done()
    })

    it('should get all pairs', function(done) {
      var val = krumkake.getAll()
      assert(val)
      assert.equal(val.foo.bar, 'baz')
      assert.equal(val.one, 1)
      assert.equal(val.two, 2)
      done()
    })

  })

  describe('Del', function() {
    var krumkake

    beforeEach(function(done) {
      cookies.get = sinon.spy(function(){
        return '{"foo":{"bar":"baz"},"one":1,"two":2}'
      })
      krumkake = new Krumkake(null, null, { cookies:cookies })
      done()
    })

    it('should delete a key-value pair', function(done) {
      var val = krumkake.get('one')
      assert.equal(val, 1)

      krumkake.del('one')
      val = krumkake.get('one')
      assert(!val)
      done()
    })

    it('should delete all when key is omitted', function(done) {
      krumkake.delAll = sinon.spy()
      krumkake.del()
      assert(krumkake.delAll.calledOnce)
      done()
    })

  })

  describe('Del all', function() {
    var krumkake

    beforeEach(function(done) {
      cookies.get = sinon.spy(function(){
        return '{"foo":{"bar":"baz"},"one":1,"two":2}'
      })
      krumkake = new Krumkake(null, null, { cookies:cookies })
      done()
    })

    it('should delete all pairs', function(done) {
      var val = krumkake.get('one')
      assert.equal(val, 1)

      val = krumkake.get('two')
      assert.equal(val, 2)

      krumkake.delAll()

      val = krumkake.get('one')
      assert(!val)
      val = krumkake.get('two')
      assert(!val)

      assert(cookies.set.calledWithExactly('s', '', krumkake.setOpts))

      done()
    })

  })

})
