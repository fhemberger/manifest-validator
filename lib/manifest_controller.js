'use strict';

var Busboy   = require('busboy'),
    config   = require('./config.js'),
    Manifest = require('./manifest.js');


// Default error responses
var ERR_INVALID_API_CALL = {
  result: {
    isValid: false,
    errors : 'ERR_INVALID_API_CALL'
  },
  statusCode: 400
};

var ERR_FILE_TOO_LARGE = {
  result: {
    isValid: false,
    errors: 'ERR_FILE_TOO_LARGE'
  },
  statusCode: 413
};

var ERR_INVALID_FILE = {
  result: {
    isValid: false,
    errors: 'ERR_INVALID_FILE'
  },
  statusCode: 415
};


function validateUri(uri, callback) {
  var manifest = new Manifest();

  manifest.loadFromUri(uri, function(err) {
    if (err) {
      return callback({
        source: 'uri',
        uri: uri,
        result: {
          isValid: false,
          errors:  err
        }
      });
    }

    manifest.validate();
    manifest.checkResources(function() {
      callback({
        source: 'uri',
        uri: uri,
        result: {
          isValid:   (manifest.errors.length || manifest.invalidResources.length) ? false : true,
          errors:    manifest.errors,
          warnings:  manifest.warnings,
          resources: manifest.invalidResources
        }
      });
    });
  });
}


function validateDirectInput(directinput, callback) {
  var manifest = new Manifest(directinput);

  manifest.validate();
  callback({
    source: 'directinput',
    result: {
      isValid:  (manifest.errors && manifest.errors.length && manifest.errors.length !== 0) ? false : true,
      errors:   manifest.errors,
      warnings: manifest.warnings
    }
  });
}


exports.dispatchPOST = function(req, res, dispatchFunction) {
  var formAlreadyParsed   = false;
  var callback = dispatchFunction(req, res);

  var busboy = new Busboy({
    headers: req.headers,
    limits: {
      fields   : 1,
      files    : 1,
      fileSize : config.upload.maxFilesize
    }
  });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var fileContents = '';
    formAlreadyParsed = true;

    file.on('data', function(data) {
      fileContents += data.toString();
    });

    file.on('end', function(data) {
      if (data) {
        fileContents += data.toString();
      }

      if (file.truncated) {
        fileContents = null;
        return callback(ERR_FILE_TOO_LARGE);
      }

      var manifest = new Manifest(fileContents);
      fileContents = null;

      manifest.validate();
      return callback({
        source: 'upload',
        result: {
          isValid:  (manifest.errors && manifest.errors.length) ? false : true,
          errors:   manifest.errors,
          warnings: manifest.warnings
        }
      });
    });

    if (! (mimetype === 'application/octet-stream' || mimetype.indexOf('text/') === 0) ) {
      file
        .removeAllListeners('data')
        .removeAllListeners('end');

      // Wrong file type
      // @return [http:415] Media type not supported
      return callback(ERR_INVALID_FILE);
    }

  });


  busboy.on('field', function(fieldname, val) {
    if (formAlreadyParsed) { return; }

    // Input fields: URI
    if (fieldname === 'uri') {
      formAlreadyParsed = true;
      validateUri(val, callback);
    }

    // Input fields: Direct Input
    if (fieldname === 'directinput') {
      formAlreadyParsed = true;
      validateDirectInput(val, callback);
    }
  });


  busboy.on('finish', function() {
    if (formAlreadyParsed) { return; }

    // No (valid) input given (e.g. different field names)
    // @return [http:400] Bad request
    callback(ERR_INVALID_API_CALL);
  });

  req.pipe(busboy);


  // No file/field in call? Close connection after timeout
  var requestTimeout = setTimeout(function() {
    if (formAlreadyParsed) {
      return clearTimeout(requestTimeout);
    }

    // No (valid) input given (e.g. no parameters at all) or parsing timeout
    // @return [http:400] Bad request
    callback(ERR_INVALID_API_CALL);

  }, config.upload.timeout);
};


exports.dispatchGET = function(req, res, dispatchFunction) {
  var callback = dispatchFunction(req, res);

  // Input fields: URI
  if (req.query && req.query.uri) {
    return validateUri(req.query.uri, callback);
  }

  // Input fields: Direct Input
  if (req.query && req.query.directinput) {
    return validateDirectInput(req.query.directinput, callback);
  }

  // No (valid) query string input given
  // @return [http:400] Bad request
  callback(ERR_INVALID_API_CALL);
};


// Expose private functions in testing environment
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    validateUri         : validateUri,
    validateDirectInput : validateDirectInput,
    dispatchPOST        : exports.dispatchPOST,
    dispatchGET         : exports.dispatchGET
  };
}
