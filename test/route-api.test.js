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
describe('[routes/api.js] API route specific functions', function() {

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
      result           = dispatchFunction({
        result : {'foo' : 'bar'},
        statusCode: 100
      });

      mock.res.HTTPStatusCode.should.equal(100);
      mock.res.testResult.should.include.keys('foo');
      mock.res.testResult.foo.should.equal('bar');
    });


    it('should return a JSON response by default', function() {
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res),
      result           = dispatchFunction({
        result : {'foo' : 'bar'}
      });

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
      mock.req.query.callback = 'myFunction';
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res),
      result           = dispatchFunction({
        result : {'foo' : 'bar'}
      });

      mock.res.HTTPHeader.should.include.keys('Content-Type');
      mock.res.HTTPHeader['Content-Type'].should.equal('text/javascript; charset=utf-8');

      mock.req.query.callback.should.equal('myFunction');
    });


    it('should return a JSONP response with the default callback name if an invalid callback function name is set', function() {
      mock.req.query.callback = '☺';
      dispatchFunction = apiRoute.dispatchAPI(mock.req, mock.res),
      result           = dispatchFunction({
        result : {'foo' : 'bar'}
      });

      mock.req.query.callback.should.equal('callback');
    });
  });

});
