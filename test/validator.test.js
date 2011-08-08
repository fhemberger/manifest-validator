var nodeunit = require('nodeunit'),
    ManifestValidator = require('../lib/validator.js');


// ----------------------------------------------------------------------------
exports['Load from URI'] = {
  'Invalid URI': function(test) {
    var validator = new ManifestValidator();
    validator.loadFromUri('file://no/valid/url', function(err, data) {
      test.equal(err, 'ERR_INVALID_URI');
      test.done();
    });
  },

  '404': function(test) {
    var validator = new ManifestValidator();
    validator.loadFromUri('http://manifest-validator.com/test/notfound', function(err, data) {
      test.equal(err, 'ERR_LOAD_URI');
      test.done();
    });
  },

  'Valid URL': function(test) {
    var validator = new ManifestValidator();
    validator.loadFromUri('http://manifest-validator.com/test/test.manifest', function(err, data) {
      test.notEqual(data.length, 0);
      test.done();
    });
  }
};


// ----------------------------------------------------------------------------
exports['Check MIME type'] = {
  'Invalid MIME type': function(test) {
    var validator = new ManifestValidator();
    test.equal(validator.checkMimeType(), false);
    test.done();
  },
  
  'Valid MIME type': function(test) {
    var validator = new ManifestValidator();
    validator.mimeType = 'text/cache-manifest';
    test.equal(validator.checkMimeType(), true);
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['Check Resources'] = {
  'Empty resources': function(test) {
    var validator = new ManifestValidator();
    validator.checkResources(function() {
      test.equal(validator.invalidResources.length, 0);
      test.done();
    });
  },

  'Inalid resource': function(test) {
    var validator = new ManifestValidator();
    validator.resources = ['http://manifest-validator.com/test/notfound'];
    validator.checkResources(function() {
      test.equal(validator.invalidResources.length, 1);
      test.done();
    });
  },

  'Valid resource': function(test) {
    var validator = new ManifestValidator();
    validator.resources = ['http://manifest-validator.com/test/test.manifest'];
    validator.checkResources(function() {
      test.equal(validator.invalidResources.length, 0);
      test.done();
    });
  }
};


// ----------------------------------------------------------------------------
exports['Validate'] = {
  'Empty': function(test) {
    var validator = new ManifestValidator();
    validator.validate();
    test.equal(validator.errors[0].error, 'ERR_EMPTY_FILE');
    test.done();
  },

  'Invalid manifest header': function(test) {
    var validator = new ManifestValidator();
    validator.validate('MANIFEST HEADER');
    test.equal(validator.errors[0].error, 'ERR_MANIFEST_HEADER');
    test.done();
  },

  'FALLBACK: Same origin policy': function(test) {
    var validator = new ManifestValidator();
    validator.validate("CACHE MANIFEST\nFALLBACK:\n/ https://127.0.0.1/");
    test.equal(validator.errors.length, 3);
    test.equal(validator.errors[2].error, 'ERR_FALLBACK_SAME_ORIGIN');
    test.done();
  },

  'NETWORK: Same URI sheme': function(test) {
    var validator = new ManifestValidator();
    validator.validate("CACHE MANIFEST\nNETWORK:\nhttps://127.0.0.1/");
    test.equal(validator.errors.length, 3);
    test.equal(validator.errors[2].error, 'ERR_WHITELIST_SAME_SHEME');
    test.done();
  },

  'Valid manifest header': function(test) {
    var validator = new ManifestValidator();
    validator.validate('CACHE MANIFEST');
    test.equal(validator.errors.length, 0);
    test.equal(validator.resources.length, 0);
    test.done();
  }
};