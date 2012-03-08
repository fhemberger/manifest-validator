/*jshint node:true, strict:false */

var fs       = require('fs'),
    url      = require('url'),
    lang     = require('../views/lang'),
    Manifest = require('./manifest.js');


// Optional tracking for API calls
var ga = (function(){
  try {
    var ga_config = JSON.parse(fs.readFileSync(__dirname + '/../ga_config.json', 'utf8')),
        account   = ga_config.account,
        host      = (ga_config.host && ga_config.host !== '') ? ga_config.host : 'localhost',
        analytics = require('ga');
    if (!account) { return; }
    return new analytics(account, host);
  } catch (e) {
    console.error('Analytics Error: Could not load configuration.');
    return;
  }
})();


function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


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
    }, 415); // 415: Media type not supported
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


function formatLogUrl(reqUrl, param) {
    var urlComponents = url.parse(reqUrl, true);

    // Cleanup parameters
    if ((urlComponents && urlComponents.query && urlComponents.query.directinput) || (param && param.directinput)) {
      urlComponents.query.directinput = '';
    }
    if (param && param.url) {
      urlComponents.query.url = param.url;
    }
    urlComponents.search = null;
    return url.format(urlComponents);
}


function dispatchApi(req, res, param) {
  return function(result, status) {
    var userAgent = decodeURIComponent(req.header('User-Agent')) || '',
        loggedUrl = decodeURIComponent(formatLogUrl(req.url, param));

    if (status) {
      res.send(status);
      return;
    }

    // Log API requests for debugging
    console.log('API call:',
      "\n\t" + req.method + ' ' + loggedUrl,
      "\n\t" + userAgent
    );

    // Just log the User Agent in Google Analytics
    if (ga && ga.host !== 'localhost') {
      ga.trackPage('/api/validate' + (userAgent !== '' ? '?user-agent=' + encodeURIComponent(userAgent) : ''));
    }

    var mimeType = 'application/json';
    var body = JSON.stringify(result);


    if (param && param.callback) {
      var jsonpCallbackName = (isValidFunctionName(param.callback) ? param.callback : 'callback');
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
  var callback, param;

  // API allows GET or POST, HTML only POST via form
  if (output === 'api') {
    param    = (req.body && !isEmpty(req.body)) ? req.body : req.query;
    callback = dispatchApi(req, res, param);
  } else {
    param    = req.body;
    callback = dispatchWeb(req, res);
  }

  // Input fields
  if (param) {
    if (param.uri && param.uri !== '') {                            // URI
      validateUri(param.uri, callback);
      return;
    } else if (param.directinput && param.directinput !== '') {     // Direct Input
      validateDirectInput(param.directinput, callback);
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
  }, 400); // 400: Bad request

};
