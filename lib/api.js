var fs = require('fs'),
    lang = require('../views/lang');

var ManifestValidator = require('./validator.js');


function validateUri(uri, callback) {
  var validator = new ManifestValidator();

  validator.loadFromUri(uri, function(err, data) {
    if (err) {
      callback({
        isValid: false,
        errors:  err
      });
    } else {
      validator.validate(data);
      // Check for MIME type has been removed from current appcache spec:
      // http://html5.org/tools/web-apps-tracker?from=6822&to=6823
      // validator.checkMimeType();
      validator.checkResources(function(){
        callback({
          isValid:   (validator.errors.length || validator.invalidResources.length) ? false : true,
          errors:    validator.errors,
          resources: validator.invalidResources
        });
      });
    }
  });
}


function validateUpload(upload, callback) {
  var validator = new ManifestValidator();

  if (upload.type.indexOf('text/') === 0) {
    fs.readFile(upload.path, 'utf8', function(err, data) {
      if (data) { validator.validate(data); }
      var errors = err ? 'ERR_LOAD_FILE' : validator.errors;
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
  var validator = new ManifestValidator();

  validator.validate(directinput);
  callback({
    isValid: (validator.errors && validator.errors.length) ? false : true,
    errors:  validator.errors
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


exports.dispatch = function(req, res) {
  var self = this;

  // Route parameter
  if (req.params[0] === '/api') {
    self.callback = function(result) {
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
  } else {
    self.callback = function(result) {
      res.local('view', 'result');
      res.local('lang', lang);

      // Set defaults if variables do not exist. Necessary for jade.
      result.errors    = result.errors || [];
      result.resources = result.resources || [];

      res.render('result', {locals: result});
    };
  }

  if (req.body) {
    // Input fields

    if (req.body.uri && req.body.uri !== '') {
      // URI
      validateUri(req.body.uri, self.callback);
    } else if (req.body.directinput && req.body.directinput !== '') {
      // Direct Input
      validateDirectInput(req.body.directinput, self.callback);
    } else {
      // No valid input

      self.callback({
        isValid: false,
        errors : 'ERR_INVALID_API_CALL'
      });
    }
  } else if (req.form) {
    // File Upload

    req.form.complete(function(err, fields, files) {
      if (err) {
        self.callback({
          isValid: false,
          errors: 'ERR_INVALID_FILE'
        });
      } else {
        validateUpload(files.upload, self.callback);
      }
    });
  } else {
    // No valid input
    self.callback({
      isValid: false,
      errors : 'ERR_INVALID_API_CALL'
    });
  }
};
