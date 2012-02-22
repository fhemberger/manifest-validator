/*jshint node:true, strict:false */

var fs       = require('fs'),
    lang     = require('../views/lang'),
    Manifest = require('./manifest.js');


function validateUri(uri, callback) {
  var manifest = new Manifest();

  manifest.loadFromUri(uri, function(err, data) {
    if (err) {
      callback({
        isValid: false,
        errors:  err
      });
    } else {
      manifest.validate();
      // Check for MIME type has been removed from current appcache spec:
      // http://html5.org/tools/web-apps-tracker?from=6822&to=6823
      // manifest.checkMimeType();
      manifest.checkResources(function(){
        callback({
          isValid:   (manifest.errors.length || manifest.invalidResources.length) ? false : true,
          errors:    manifest.errors,
          resources: manifest.invalidResources
        });
      });
    }
  });
}


function validateUpload(upload, callback) {
  if (upload && upload.type && upload.type.indexOf('text/') === 0) {
    fs.readFile(upload.path, 'utf8', function(err, data) {
      var errors;
      if (data) {
        var manifest = new Manifest(data);
        manifest.validate();
        errors = manifest.errors;
      } else {
        errors = 'ERR_LOAD_FILE';
      }
      callback({
        isValid: (errors && errors.length) ? false : true,
        errors: errors
      });
    });
  } else {
    callback({
      isValid: false,
      errors: 'ERR_INVALID_FILE'
    });
  }
}


function validateDirectInput(directinput, callback) {
  var manifest = new Manifest(directinput);

  manifest.validate();
  callback({
    isValid: (manifest.errors && manifest.errors.length && manifest.errors.length !== 0) ? false : true,
    errors:  manifest.errors
  });
}


// Based on this discussion at Stack Overflow:
// http://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
function isValidFunctionName(name) {
  var validName = /^[$A-Za-z_][0-9A-Za-z_]*$/,
    reservedWords = ['instanceof', 'typeof', 'break', 'do', 'new', 'var', 'case', 'else', 'return', 'void', 'catch', 'finally',
      'continue', 'for', 'switch', 'while', 'this', 'with', 'debugger', 'function', 'throw', 'default', 'if',
      'try', 'delete', 'in'];
  return (validName.test(name) && reservedWords.indexOf(name) === -1);
}



function dispatchApi(req, res) {
  return function(result) {
    var mimeType = 'application/json';
    var body = JSON.stringify(result);

    if (req.body && req.body.callback) {
      var jsonpCallbackName = (isValidFunctionName(req.body.callback) ? req.body.callback : 'callback');
      mimeType = 'text/javascript';
      body = jsonpCallbackName + '(' + body + ')';
    }

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Content-Type', mimeType + '; charset=utf-8');
    res.header('Content-Length', Buffer.byteLength(body, 'utf-8'));
    res.end(body);
  };
}


function dispatchWeb(req, res) {
  return function(result) {
    res.render('result', {
      view:      'result',
      lang:      lang,
      isValid:   result.isValid,
      errors:    result.errors || [],
      resources: result.resources || []
    });
  };
}


exports.dispatch = function(output, req, res) {
  var callback = (output === 'api') ? dispatchApi(req, res) : dispatchWeb(req,res);

  // Input fields
  if (req.body) {
    if (req.body.uri && req.body.uri !== '') {                            // URI
      validateUri(req.body.uri, callback);
      return;
    } else if (req.body.directinput && req.body.directinput !== '') {     // Direct Input
      validateDirectInput(req.body.directinput, callback);
      return;
    }
  }

  // File Upload
  if (req.form) {
    req.form.complete(function(err, fields, files) {
      if (!err) {
        validateUpload(files.upload, callback);
      } else {
        callback({
          isValid: false,
          errors: 'ERR_INVALID_FILE'
        });
      }
    });
    return;
  }

  // No valid input
  callback({
    isValid: false,
    errors : 'ERR_INVALID_API_CALL'
  });
};
