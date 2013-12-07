'use strict';

var fs       = require('fs'),
    Busboy   = require('busboy'),
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

/*
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
*/

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
  var parsed   = false;
  var param    = (req.body && !isEmpty(req.body)) ? req.body : req.query;
  var callback = function(req, res){ };//dispatchFunction(req, res, param);

  var busboy = new Busboy({
    headers: req.headers,
    limits: {
      files    : 1,
      fileSize : (1 * 1024 * 1024)
    }
  });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var fileContents = '';

    if (
      mimetype.indexOf('text/') !== 0 ||
      mimetype !== 'application/octet-stream') {
        callback({
          isValid: false,
          errors: 'ERR_INVALID_FILE'
        }, 415); // 415: Media type not supported
    }

    console.log('File [' + fieldname +']: filename: ' + filename + ', encoding: ' + encoding);

    file.on('data', function(data) {
      console.log('File [' + fieldname +'] got ' + data.length + ' bytes');
      fileContents += data.toString();
    });

    file.on('end', function(data) {
      if (data) {
        fileContents += data.toString();
      }
      console.log('File [' + fieldname +'] Finished');

      var manifest = new Manifest(data);
      manifest.validate();
      var errors   = manifest.errors;
      var warnings = manifest.warnings;
      callback({
        isValid:  (errors && errors.length) ? false : true,
        errors:   errors,
        warnings: warnings
      });
    });
  });

  busboy.on('limit', function() {
    console.log('filesize limit exceeded!');
  });

  busboy.on('field', function(fieldname, val, valTruncated, keyTruncated) {
    if (parsed) { return; }
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));

    // Input fields: URI
    if (fieldname === 'uri') {
      parsed = true;
      validateUri(val, callback);
    }

    // Input fields: Direct Input
    if (fieldname === 'directinput') {
      parsed = true;
      validateDirectInput(val, callback);
    }
  });

  busboy.on('end', function() {
    console.log('Done parsing form!');

    if (parsed) { return; }

    // No valid input
    callback({
      isValid: false,
      errors : 'ERR_INVALID_API_CALL'
    }, 400); // 400: Bad request
  });
  req.pipe(busboy);

  /**
   * Get parameters via POST or GET.
   * If POST parameters are found, url parameters are ignored.
   *
   * req.body  = POST values
   * req.query = GET values
   */
/*
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
  console.log('param', param, req);
  if (req.files && req.files.upload) {
    return validateUpload(req.files.upload, callback);
  }

  // No valid input
  callback({
    isValid: false,
    errors : 'ERR_INVALID_API_CALL'
  }, 400); // 400: Bad request
*/
};


// Expose private functions in testing environment
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    validateUri         : validateUri,
    validateUpload      : validateUpload,
    validateDirectInput : validateDirectInput,
    dispatch            : exports.dispatch
  };
}
