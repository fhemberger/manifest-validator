'use strict';

var manifestController  = require('../lib/manifest_controller'),
    isValidFunctionName = require('../lib/validate-function-name'),
    analytics           = require('../lib/analytics');



function cleanupLogUrl(param) {
  var output = [];

  // Strip directinput content from logging
  if (param && param.directinput) { param.directinput = ''; }

  for (var key in param) {
    output.push(key + '=' + param[key]);
  }
  return '/api/validate?' + output.join('&');
}


function logAPICall(req, param) {
  var userAgent = req.header('User-Agent') ? decodeURIComponent(req.header('User-Agent')) : '',
      loggedUrl = cleanupLogUrl(param);

  // Log API requests for debugging
  console.log('API call:',
    "\n\t" + req.method + ' ' + loggedUrl,
    "\n\tUser-Agent: " + userAgent
  );

  // Just log the User Agent in Google Analytics
  analytics.trackGA(userAgent);
  analytics.trackPiwik(req, param);
}


function dispatchAPI(req, res, param) {
  param = param || {};

  return function(result, status) {

    // If a staus is explicitly set, it's an invalid API call
    if (status) { return res.send(status, result); }

    logAPICall(req, param);

    // Add CORS header
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    // Defalut response is JSON if 'callback' is not specified
    if (param && !param.callback) {
      return res.json(result);
    }

    // Otherwise send JSONP
    // JSONP accepts only GET requests by spec
    if (req.method !== 'GET') {
      return res.send('405');
    }

    // Only allow valid callback names
    param.callback = isValidFunctionName(param.callback)
      ? param.callback
      : 'callback';

    if (process.env.NODE_ENV === 'test') { req.param = param; }
    res.jsonp(result);
  };
}


exports.index = function(req, res) {
  res.json({
    api: {
      version       : '1.0',
      endpoint      : 'http://manifest-validator.com/api/validate',
      documentation : 'https://github.com/fhemberger/manifest-validator/wiki/API-Documentation'
    }
  });
};


exports.validate = function(req, res) {
  manifestController.dispatch(dispatchAPI, req, res);
};


// Expose private functions in testing environment
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    cleanupLogUrl : cleanupLogUrl,
    logAPICall    : logAPICall,
    dispatchAPI   : dispatchAPI,
    index         : exports.index,
    validate      : exports.validate
  };
}
