'use strict';

require('chai').should();
var mock     = require('./helper/mock'),
    apiRoute = require('../routes/api.js');


// Suppress API debug output
var logMethod = global.console.log;
global.console.log = function(){
  if (arguments[0] == 'API call:') { return; }
  logMethod.apply(this, arguments);
};


// -- Tests -------------------------------------------------------------------
describe('API route specific functions', function() {

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
    var dispatchFunction, result;

    afterEach(function() {
      dispatchFunction = result = undefined;
    });


    it('should return a function', function() {
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res);
      dispatchFunction.should.be.a('function');
    });


    it('should exit with the HTTP status code given', function() {
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res),
      result           = dispatchFunction({'foo' : 'bar'}, 100);

      mock.res.HTTPStatusCode.should.equal(100);
      mock.res.testResult.should.include.keys('foo');
      mock.res.testResult.foo.should.equal('bar');
    });


    it('should return a JSON response by default', function() {
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res),
      result           = dispatchFunction({'foo' : 'bar'});

      mock.res.HTTPHeader.should.include.keys('Access-Control-Allow-Origin');
      mock.res.HTTPHeader['Access-Control-Allow-Origin'].should.equal('*');

      mock.res.HTTPHeader.should.include.keys('Access-Control-Allow-Headers');
      mock.res.HTTPHeader['Access-Control-Allow-Headers'].should.equal('X-Requested-With');

      mock.res.HTTPHeader.should.include.keys('Content-Type');
      mock.res.HTTPHeader['Content-Type'].should.equal('application/json; charset=utf-8');

      mock.res.testResult.should.include.keys('foo');
      mock.res.testResult.foo.should.equal('bar');
    });


    it('should return a JSONP response if a callback parameter is set', function() {
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res, {'callback' : 'myFunction'}),
      result           = dispatchFunction({'foo' : 'bar'});

      mock.res.HTTPHeader.should.include.keys('Content-Type');
      mock.res.HTTPHeader['Content-Type'].should.equal('text/javascript; charset=utf-8');

      mock.req.param.callback.should.equal('myFunction');
    });


    it('should return a JSONP response with the default callback name if an invalid callback function name is set', function() {
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res, {'callback' : '☺'}),
      result           = dispatchFunction({'foo' : 'bar'});

      mock.req.param.callback.should.equal('callback');
    });
  });

});
