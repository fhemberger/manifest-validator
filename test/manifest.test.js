var nodeunit = require('nodeunit'),
    Manifest = require('../lib/manifest.js');


// ----------------------------------------------------------------------------
exports['Load from URI'] = {
  'Invalid URI': function(test) {
    var manifest = new Manifest();
    manifest.loadFromUri('file://no/valid/url', function(err, data) {
      test.equal(err, 'ERR_INVALID_URI');
      test.done();
    });
  },

  '404': function(test) {
    var manifest = new Manifest();
    manifest.loadFromUri('http://manifest-validator.com/test/notfound', function(err, data) {
      test.equal(err, 'ERR_LOAD_URI');
      test.done();
    });
  },

  'Valid URL': function(test) {
    var manifest = new Manifest();
    manifest.loadFromUri('http://manifest-validator.com/test/test.manifest', function(err, data) {
      test.notEqual(data.length, 0);
      test.done();
    });
  }
};


// ----------------------------------------------------------------------------
exports['Check Resources'] = {
  'Empty resources': function(test) {
    var manifest = new Manifest();
    manifest.checkResources(function() {
      test.equal(manifest.invalidResources.length, 0);
      test.done();
    });
  },

  'Inalid resource': function(test) {
    var manifest = new Manifest();
    manifest.resources = ['http://manifest-validator.com/test/notfound'];
    manifest.checkResources(function() {
      test.equal(manifest.invalidResources.length, 1);
      test.done();
    });
  },

  'Valid resource': function(test) {
    var manifest = new Manifest();
    manifest.resources = ['http://manifest-validator.com/test/test.manifest'];
    manifest.checkResources(function() {
      test.equal(manifest.invalidResources.length, 0);
      test.done();
    });
  }
};


// ----------------------------------------------------------------------------
exports['Validate'] = {
  'Empty': function(test) {
    var manifest = new Manifest();
    manifest.validate();
    test.equal(manifest.errors[0].error, 'ERR_EMPTY_FILE');
    test.done();
  },

  'Invalid manifest header': function(test) {
    var manifest = new Manifest('MANIFEST HEADER');
    manifest.validate();
    test.equal(manifest.errors[0].error, 'ERR_MANIFEST_HEADER');
    test.done();
  },

  'FALLBACK: Same origin policy': function(test) {
    var manifest = new Manifest("CACHE MANIFEST\nFALLBACK:\n/ https://127.0.0.1/");
    manifest.validate();
    test.equal(manifest.errors.length, 3);
    test.equal(manifest.errors[2].error, 'ERR_FALLBACK_SAME_ORIGIN');
    test.done();
  },

  'NETWORK: Same URI sheme': function(test) {
    var manifest = new Manifest("CACHE MANIFEST\nNETWORK:\nhttps://127.0.0.1/");
    manifest.validate();
    test.equal(manifest.errors.length, 3);
    test.equal(manifest.errors[2].error, 'ERR_WHITELIST_SAME_SHEME');
    test.done();
  },

  'Valid manifest header': function(test) {
    var manifest = new Manifest('CACHE MANIFEST');
    manifest.validate();
    test.equal(manifest.errors.length, 0);
    test.equal(manifest.resources.length, 0);
    test.done();
  }
};