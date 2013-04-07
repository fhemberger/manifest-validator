var should             = require('chai').should(),
    mock               = require('./helper/mock'),
    manifestController = require('../lib/manifest_controller.js');


/*jshint expr:true, es5:true*/
var ASYNC_TIMEOUT = 2000;


// Suppress API debug output
var logMethod = global.console.log;
global.console.log = function(){
  if (arguments[0] == 'API call:') { return; }
  logMethod.apply(this, arguments);
};


// -- Tests -------------------------------------------------------------------
describe('manifestController (API)', function() {
  var req, res;

  beforeEach(function() {
    req = mock.req;
    res = mock.res;
  });

  it('should fail without parameters', function() {
    manifestController.dispatch('api', req, res);
    should.exist(res.testResult);
    res.testResult.should.equal(400);
  });


  it('should fail with unknown parameters', function() {
    req.body = { unknownparameter: true };

    manifestController.dispatch('api', req, res);
    should.exist(res.testResult);
    res.testResult.should.equal(400);
  });


  it('should fail if the URL does not point to a manifest file', function(done) {
    req.body = { uri: 'http://www.example.com/' };
    req.form = undefined;

    manifestController.dispatch('api', req, res);
    should.exist(res.testResult);
    setTimeout(function() {
      res.testResult.should.have.ownProperty('isValid');
      res.testResult.isValid.should.be.false;
      done();
    }, ASYNC_TIMEOUT);
  });


  // ----------------------------------------------------------------------------
  describe('Direct input', function() {

    it('should fail on invalid manifest', function() {
      req.body = { directinput: 'INVALID CACHE MANIFEST' };
      req.form = undefined;

      manifestController.dispatch('api', req, res);
      should.exist(res.testResult);
      res.testResult.should.have.ownProperty('isValid');
      res.testResult.isValid.should.be.false;
    });


    it('should succeed on valid manifest', function() {
      req.body = { directinput: 'CACHE MANIFEST' };
      req.form = undefined;

      manifestController.dispatch('api', req, res);
      should.exist(res.testResult);
      res.testResult.should.have.ownProperty('isValid');
      res.testResult.isValid.should.be.true;
    });

  });


  // ----------------------------------------------------------------------------
  describe('JSONP callback', function() {
    it('should fall back to default value if callback name is invalid', function() {
      req.body = {
        callback    : 'this',
        directinput : 'CACHE MANIFEST'
      };
      req.form = undefined;

      manifestController.dispatch('api', req, res);
      should.exist(res.callbackName);
      res.callbackName.should.equal('callback');
    });


    it('should accept/use valid callback names', function() {
      req.body = {
        callback    : 'myCallbackName',
        directinput : 'CACHE MANIFEST'
      };
      req.form = undefined;

      manifestController.dispatch('api', req, res);
      should.exist(res.callbackName);
      res.callbackName.should.equal(req.body.callback);
    });

  });

});