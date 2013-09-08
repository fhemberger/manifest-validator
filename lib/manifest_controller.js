'use strict';

var fs       = require('fs'),
    Manifest = require('./manifest.js');


function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


function validateUri(uri, callback) {
  var manifest = new Manifest();

  manifest.loadFromUri(uri, function(err) {
    if (err) {
      return callback({
        isValid: false,
        errors:  err
      });
    }

    manifest.validate();
    manifest.checkResources(function() {
      callback({
        isValid:   (manifest.errors.length || manifest.invalidResources.length) ? false : true,
        errors:    manifest.errors,
        warnings:  manifest.warnings,
        resources: manifest.invalidResources
      });
    });
  });
}


function validateUpload(upload, callback) {
  var mimeType = (upload && upload.headers && upload.headers['content-type']) ? upload.headers['content-type'] : undefined;
  if (mimeType.indexOf('text/') === 0 || mimeType === 'application/octet-stream') {
    fs.readFile(upload.path, 'utf8', function(err, data) {
      var errors, warnings;
      if (data) {
        var manifest = new Manifest(data);
        manifest.validate();
        errors   = manifest.errors;
        warnings = manifest.warnings;
      } else {
        errors   = 'ERR_LOAD_FILE';
        warnings = [];
      }
      callback({
        isValid:  (errors && errors.length) ? false : true,
        errors:   errors,
        warnings: warnings
      });
    });
  } else {
    callback({
      isValid: false,
      errors: 'ERR_INVALID_FILE'
    }, 415); // 415: Media type not supported
  }
}


function validateDirectInput(directinput, callback) {
  var manifest = new Manifest(directinput);

  manifest.validate();
  callback({
    isValid:  (manifest.errors && manifest.errors.length && manifest.errors.length !== 0) ? false : true,
    errors:   manifest.errors,
    warnings: manifest.warnings
  });
}


exports.dispatch = function(dispatchFunction, req, res) {
  /**
   * Get parameters via POST or GET.
   * If POST parameters are found, url parameters are ignored.
   *
   * req.body  = POST values
   * req.query = GET values
   */
  var param    = (req.body && !isEmpty(req.body)) ? req.body : req.query;
  var callback = dispatchFunction(req, res, param);

  // Input fields: URI
  if (param && param.uri) {
    return validateUri(param.uri, callback);
  }

  // Input fields: Direct Input
  if (param && param.directinput) {
    return validateDirectInput(param.directinput, callback);
  }

  // File Upload
  if (req.files && req.files.upload) {
    return validateUpload(req.files.upload, callback);
  }

  // No valid input
  callback({
    isValid: false,
    errors : 'ERR_INVALID_API_CALL'
  }, 400); // 400: Bad request
};


// Expose private functions in testing environment
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    validateUri         : validateUri,
    validateUpload      : validateUpload,
    validateDirectInput : validateDirectInput
  };
}
