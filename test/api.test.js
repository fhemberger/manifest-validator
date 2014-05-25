'use strict';

var request = require('supertest'),
    expect  = require('chai').expect,
    app     = require('../app/index.js');


var json = function(res) {
  return JSON.parse(res.text);
};


describe('API', function() {

  describe('GET /api', function() {

    it('should respond with an API description', function(done) {
      request(app)
        .get('/api')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res) {
          if (err) return done(err);

          expect(json(res).api.version).to.equal('1.0');
          done();
        });
    });

  });


  describe('GET /api/validate', function() {

    it('should respond with 400 if no parameters are given', function(done) {
      request(app)
        .get('/api/validate')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);

          expect(json(res).errors).to.equal('ERR_INVALID_API_CALL');
          done();
        });
    });

    it('should only parse the first parameter occurrence (avoid HTTP Parameter Pollution)', function(done) {
      request(app)
        .get('/api/validate?directinput=foo&directinput=bar')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect(/\[{"error":"ERR_MANIFEST_HEADER","content":"foo"}\]/, done);
    });

    it('should return a JSON response by default', function(done) {
      request(app)
        .get('/api/validate?directinput=CACHE%20MANIFEST')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Access-Control-Allow-Headers', 'X-Requested-With')
        .expect(200, done);
    });

    it('should return a JSONP response if a callback parameter is set', function(done) {
      request(app)
        .get('/api/validate?directinput=CACHE%20MANIFEST&callback=myFunction')
        .expect('Content-Type', 'text/javascript; charset=utf-8')
        .expect(200, /^typeof myFunction\b/, done);
    });

    it('should return a JSONP response with the default callback name if an invalid callback function name is set', function(done) {
      request(app)
        .get('/api/validate?directinput=CACHE%20MANIFEST&callback=☺')
        .expect('Content-Type', 'text/javascript; charset=utf-8')
        .expect(200, /^typeof callback\b/, done);
    });

  });


  describe('POST /api/validate', function() {

    it('should respond with 400 if no parameters are given', function(done) {
      request(app)
        .post('/api/validate')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);

          expect(json(res).errors).to.equal('ERR_INVALID_API_CALL');
          done();
        });
    });

    it('should respond with 400 if POST payload is sent JSON encoded', function(done) {
      request(app)
        .post('/api/validate')
        .send({ 'directinput': 'foo' })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);

          expect(json(res).errors).to.equal('ERR_INVALID_API_CALL');
          done();
        });
    });

    it('should only parse the first parameter occurrence (avoid HTTP Parameter Pollution)', function(done) {
      request(app)
        .post('/api/validate')
        .send('directinput=foo')
        .send('directinput=bar')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .expect(/\[{"error":"ERR_MANIFEST_HEADER","content":"foo"}\]/, done);
    });

    it('should return a JSON response by default', function(done) {
      request(app)
        .post('/api/validate')
        .send('directinput=CACHE%20MANIFEST')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Access-Control-Allow-Headers', 'X-Requested-With')
        .expect(200, done);
    });

    it('should respond with 405 when trying to get JSONP via POST', function(done) {
      request(app)
        .post('/api/validate?callback=myFunction')
        .send('directinput=CACHE MANIFEST')
        .expect('Content-Type', /^text\/plain/)
        .expect(405, done);
    });

  });

});
