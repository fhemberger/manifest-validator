'use strict';

var should             = require('chai').should(),
    mock               = require('./helper/mock'),
    manifestController = require('../app/lib/manifest_controller.js');


var ASYNC_TIMEOUT = 2000;


function dispatchTest(req, res) {
  return function(validationResponse) {
    res.testResult = validationResponse.result;
    res.statusCode = validationResponse.statusCode || 200;
  };
}


// -- Tests -------------------------------------------------------------------
describe('[manifest_controller.js] manifestController', function() {
  var req, res;

  beforeEach(function() {
    req = mock.req;
    res = mock.res;
  });

  it('should fail without parameters', function() {
    manifestController.dispatchGET(req, res, dispatchTest);
    should.exist(res.testResult);
    res.statusCode.should.equal(400);
  });


  it('should fail with unknown parameters', function() {
    req.query = { unknownparameter: true };

    manifestController.dispatchGET(req, res, dispatchTest);
    should.exist(res.testResult);
    res.statusCode.should.equal(400);
  });


  it('should fail if the URL does not point to a manifest file', function(done) {
    req.query = { uri: 'http://www.example.com/' };
    req.form = undefined;

    manifestController.dispatchGET(req, res, dispatchTest);
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
      req.query = { directinput: 'INVALID CACHE MANIFEST' };
      req.form = undefined;

      manifestController.dispatchGET(req, res, dispatchTest);
      should.exist(res.testResult);
      res.testResult.should.have.ownProperty('isValid');
      res.testResult.isValid.should.be.false;
    });


    it('should succeed on valid manifest', function() {
      req.query = { directinput: 'CACHE MANIFEST' };
      req.form = undefined;

      manifestController.dispatchGET(req, res, dispatchTest);
      should.exist(res.testResult);
      res.testResult.should.have.ownProperty('isValid');
      res.testResult.isValid.should.be.true;
    });

  });

});
