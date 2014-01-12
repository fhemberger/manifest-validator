'use strict';

require('chai').should();
var isValidFunctionName = require('../lib/validate-function-name');


// -- Tests -------------------------------------------------------------------
describe('#isValidFunctionName()', function() {
  it('should return true if function only consists of alphabetic ascii characters or "$" and "_"', function() {
    isValidFunctionName('UPPERCASE').should.be.true;
    isValidFunctionName('lowercase').should.be.true;
    isValidFunctionName('$foo').should.be.true;
    isValidFunctionName('_privateFunction').should.be.true;
    isValidFunctionName('callback1').should.be.true;
  });


  it('should return true in allowed unicode range', function() {
    isValidFunctionName('☺').should.be.false;
    isValidFunctionName('ಠ_ಠ').should.be.true;
  });


  it('should return false if function name is empty', function() {
    isValidFunctionName().should.be.false;
    isValidFunctionName('').should.be.false;
  });


  it('should return false if function name is not a string', function() {
    isValidFunctionName(null).should.be.false;
    isValidFunctionName({}).should.be.false;
    isValidFunctionName(1).should.be.false;
  });


  it('should return false if function name starts with a number', function() {
    isValidFunctionName('1').should.be.false;
  });


  it('should return false if function name is a reserved word', function() {
    isValidFunctionName(this).should.be.false;
    isValidFunctionName('this').should.be.false;
    isValidFunctionName('function').should.be.false;
  });
});

