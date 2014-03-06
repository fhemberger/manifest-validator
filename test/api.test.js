'use strict';

var request = require('supertest');
var expect = require('chai').expect;

// Suppress API debug output
var logMethod = global.console.log;
global.console.log = function() {
  if (arguments[0] == 'API call:' || /^\[Express\]/.test(arguments[0])) { return; }
  logMethod.apply(this, arguments);
};

var app = require('../app.js');


describe('API', function() {

  describe('GET /api', function() {

    it('should respond with JSON', function(done) {
      request(app)
        .get('/api')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          var body = JSON.parse(res.text);
          if (err) return done(err);

          expect(body.api).to.exist;
          expect(body.api.version).to.exist;
          expect(body.api.version).to.equal('1.0');
          done();
        });
    });

  });


  describe('GET /api/validate', function() {

    it('should respond with 400 if no parameters are given', function(done) {
      request(app)
        .get('/api/validate')
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) return done(err);
          var body = JSON.parse(res.text);

          expect(body.errors).to.exist;
          expect(body.errors).to.equal('ERR_INVALID_API_CALL');
          done();
        });
    });

  });

});
