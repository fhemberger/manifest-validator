'use strict';

require('chai').should();
var mock     = require('./helper/mock'),
    apiRoute = require('../app/routes/api.js');


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

      mock.res.HTTPHeader.should.include.keys('Content-Type');
      mock.res.HTTPHeader['Content-Type'].should.equal('application/json; charset=utf-8');

      mock.res.testResult.should.include.keys('foo');
      mock.res.testResult.foo.should.equal('bar');
    });


  });

});
