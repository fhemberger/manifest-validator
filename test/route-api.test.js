'use strict';

/*jshint expr:true, es5:true*/
var should   = require('chai').should(),
    mock     = require('./helper/mock'),
    apiRoute;

// Expose private functions in testing environment
process.env.NODE_ENV = 'test';
apiRoute             = require('../routes/api.js');


// Suppress API debug output
var logMethod = global.console.log;
global.console.log = function(){
  if (arguments[0] == 'API call:') { return; }
  logMethod.apply(this, arguments);
};


// -- Tests -------------------------------------------------------------------
describe('API route specific functions', function() {

  describe('#isValidFunctionName()', function() {
    it('should return true if function only consists of alphanumeric characters or $/_', function() {
      apiRoute.isValidFunctionName('UPPERCASE').should.be.true;
      apiRoute.isValidFunctionName('lowercase').should.be.true;
      apiRoute.isValidFunctionName('$foo').should.be.true;
      apiRoute.isValidFunctionName('_privateFunction').should.be.true;
      apiRoute.isValidFunctionName('callback1').should.be.true;
    });


    it('should return false if function name contains other characters', function() {
      apiRoute.isValidFunctionName().should.be.false;
      apiRoute.isValidFunctionName(null).should.be.false;
      apiRoute.isValidFunctionName({}).should.be.false;
      apiRoute.isValidFunctionName('').should.be.false;
      apiRoute.isValidFunctionName('1').should.be.false;
      apiRoute.isValidFunctionName('☺').should.be.false;
    });


    it('should return false if function name is a reserved word', function() {
      apiRoute.isValidFunctionName(this).should.be.false;
      apiRoute.isValidFunctionName('this').should.be.false;
      apiRoute.isValidFunctionName('function').should.be.false;
    });
  });


  describe('#cleanupLogUrl()', function() {
    it('should work without parameters', function() {
      apiRoute.cleanupLogUrl().should.equal('/api/validate?');
      apiRoute.cleanupLogUrl('').should.equal('/api/validate?');
      apiRoute.cleanupLogUrl({}).should.equal('/api/validate?');
    });


    it('should strip out values for the key "directinput"', function() {
      apiRoute.cleanupLogUrl({
        directinput : 'CACHE%20MANIFEST',
        callback    : 'myFunction'
      }).should.equal('/api/validate?directinput=&callback=myFunction');
    });


    it('should serialize all key/value pairs', function() {
      apiRoute.cleanupLogUrl({
        foo : 'fooValue',
        bar : 'barValue',
        baz : ''
      }).should.equal('/api/validate?foo=fooValue&bar=barValue&baz=');
    });
  });


  describe('#dispatchAPI()', function() {
    it('should exit with the HTTP status code given', function() {
      var dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res),
          result           = dispatchFunction({'foo' : 'bar'}, 100);

      dispatchFunction.should.be.a('function');
      mock.res.HTTPStatusCode.should.equal(100);
      mock.res.testResult.should.include.keys('foo');
      mock.res.testResult.foo.should.equal('bar');

      dispatchFunction = result = undefined;
    });


    it('should return a JSON response by default', function() {
      var dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res),
          result           = dispatchFunction({'foo' : 'bar'});

      dispatchFunction.should.be.a('function');

      mock.res.HTTPHeader.should.include.keys('Access-Control-Allow-Origin');
      mock.res.HTTPHeader['Access-Control-Allow-Origin'].should.equal('*');

      mock.res.HTTPHeader.should.include.keys('Access-Control-Allow-Headers');
      mock.res.HTTPHeader['Access-Control-Allow-Headers'].should.equal('X-Requested-With');

      mock.res.HTTPHeader.should.include.keys('Content-Type');
      mock.res.HTTPHeader['Content-Type'].should.equal('application/json; charset=utf-8');

      mock.res.testResult.should.include.keys('foo');
      mock.res.testResult.foo.should.equal('bar');

      dispatchFunction = result = undefined;
    });


    it('should return a JSONP response if a callback parameter is set', function() {
      var dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res, {'callback' : 'myFunction'}),
          result           = dispatchFunction({'foo' : 'bar'});

      dispatchFunction.should.be.a('function');

      mock.res.HTTPHeader.should.include.keys('Content-Type');
      mock.res.HTTPHeader['Content-Type'].should.equal('text/javascript; charset=utf-8');

      mock.res.callbackName.should.equal('myFunction');

      dispatchFunction = result = undefined;
    });


    it('should return a JSONP response with the default callback name if an invalid callback function name is set', function() {
      var dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res, {'callback' : '☺'}),
          result           = dispatchFunction({'foo' : 'bar'});

      dispatchFunction.should.be.a('function');
      mock.res.callbackName.should.equal('callback');

      dispatchFunction = result = undefined;
    });
  });

});
