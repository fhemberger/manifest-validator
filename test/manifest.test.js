var should   = require('chai').should(),
    Manifest = require('../lib/manifest.js');


/*jshint expr:true, es5:true*/
describe('Manifest', function() {
  var manifest;

  afterEach(function() {
    manifest = undefined;
  });


  // ----------------------------------------------------------------------------
  describe('#loadFromUri()', function() {

    beforeEach(function(){
      manifest = new Manifest();
    });

    it('should detect invalid URIs', function(done) {
      manifest.loadFromUri('file://no/valid/url', function(err, data) {
        should.exist(err);
        should.not.exist(data);
        err.should.equal('ERR_INVALID_URI');
        done();
      });
    });

    it('should detect a 404 error for the manifest file', function(done) {
      manifest.loadFromUri('http://manifest-validator.com/test/notfound', function(err, data) {
        should.exist(err);
        should.not.exist(data);
        err.should.equal('ERR_LOAD_URI');
        done();
      });
    });

    it('should load the manifest from a valid URI', function(done) {
      manifest.loadFromUri('http://manifest-validator.com/test/test.manifest', function(err, data) {
        should.not.exist(err);
        should.exist(data);
        data.should.not.be.empty;
        done();
      });
    });

  });


  // ----------------------------------------------------------------------------
  describe('#checkResources()', function() {

    beforeEach(function(){
      manifest = new Manifest();
    });

    it('should work if no resources are present', function(done) {
      manifest.checkResources(function() {
        manifest.should.have.ownProperty('invalidResources');
        manifest.invalidResources.should.be.empty;
        done();
      });
    });

    it('should fail on invalid URIs', function() {
      manifest.resources = ['file://no/valid/url'];
      manifest.checkResources.should.throw(Error);
    });

    it('should detect not exisiting resources', function(done) {
      manifest.resources = ['http://manifest-validator.com/test/notfound'];
      manifest.checkResources(function() {
        manifest.should.have.ownProperty('invalidResources');
        manifest.invalidResources.should.have.length(1);
        manifest.invalidResources[0].should.equal('http://manifest-validator.com/test/notfound');
        done();
      });
    });

    it('should pass with exisiting resources', function(done) {
      manifest.resources = ['http://manifest-validator.com/test/test.manifest'];
      manifest.checkResources(function() {
        manifest.should.have.ownProperty('invalidResources');
        manifest.invalidResources.should.be.empty;
        manifest.should.have.ownProperty('resources');
        manifest.resources.should.have.length(1);
        manifest.resources[0].should.equal('http://manifest-validator.com/test/test.manifest');
        done();
      });
    });

  });


  // ----------------------------------------------------------------------------
  describe('#validate()', function() {

    it('should fail if manifest is empty', function() {
      var manifest = new Manifest();
      var isValid  = manifest.validate();

      isValid.should.be.false;
      manifest.should.have.ownProperty('errors');
      manifest.errors.should.have.length(1);
      manifest.errors[0].error.should.equal('ERR_EMPTY_FILE');
    });

    it('should pass on valid manifest header', function() {
      var manifest = new Manifest('CACHE MANIFEST');
      var isValid  = manifest.validate();

      isValid.should.be.true;
    });

    it('should work with preceeding byte order mark (BOM)', function() {
      var manifest = new Manifest('\uFEFFCACHE MANIFEST');
      var isValid  = manifest.validate();

      isValid.should.be.true;
    });

    it('should fail on invalid manifest header', function() {
      var manifest = new Manifest('INVALID MANIFEST HEADER');
      var isValid  = manifest.validate();

      isValid.should.be.false;
      manifest.should.have.ownProperty('errors');
      manifest.errors.should.have.length(1);
      manifest.errors[0].error.should.equal('ERR_MANIFEST_HEADER');
    });

    it('should warn if same origin policy is violated in FALLBACK section', function() {
      var manifest = new Manifest("CACHE MANIFEST\nFALLBACK:\n/ https://127.0.0.1/");
      var isValid  = manifest.validate();

      // In 'file upload' and 'direct input' mode, only a warning is issued,
      // thus the manifest file is considered valid.
      isValid.should.be.true;

      // 3 = Number of lines of parsed manifest file
      manifest.warnings.should.have.length(3);
      should.not.exist(manifest.warnings[0]);
      should.not.exist(manifest.warnings[1]);
      manifest.warnings[2].error.should.equal('ERR_FALLBACK_SAME_ORIGIN');
    });

    it('should fail if sheme (i.e. protocol) of resource and manifest file differ in NETWORK section', function() {
      var manifest = new Manifest("CACHE MANIFEST\nNETWORK:\nhttps://127.0.0.1/");
      var isValid  = manifest.validate();

      isValid.should.be.false;

      // 3 = Number of lines of parsed manifest file
      manifest.errors.should.have.length(3);

      // Default manifest file protocol is http, so a resource with a https-sheme fails
      should.not.exist(manifest.errors[0]);
      should.not.exist(manifest.errors[1]);
      manifest.errors[2].error.should.equal('ERR_WHITELIST_SAME_SCHEME');
    });

  });

});
