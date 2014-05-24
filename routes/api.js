'use strict';

var manifestController  = require('../lib/manifest_controller'),
    isValidFunctionName = require('../lib/validate-function-name'),
    analytics           = require('../lib/analytics');


function dispatchAPI(req, res) {
  return function(validationResponse) {

    // If a staus is explicitly set, it's an invalid API call
    if (validationResponse.statusCode && validationResponse.statusCode !== 200) {
      res.header('Connection', 'close');
      return res.send(validationResponse.statusCode, validationResponse.result);
    }

    analytics.trackPiwik(req, validationResponse.source);

    // Add CORS header
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    // Default response is JSON if 'callback' is not specified
    if ( typeof req.query.callback !== 'string' ) {
      return res.json(validationResponse.result);
    }

    // Otherwise send JSONP
    // JSONP accepts only GET requests by spec
    if (req.method !== 'GET') {
      return res.send(405);
    }

    // Only allow valid callback names
    req.query.callback = isValidFunctionName(req.query.callback)
      ? req.query.callback
      : 'callback';

    res.jsonp(validationResponse.result);
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


exports.validateGET = function(req, res) {
  manifestController.dispatchGET(req, res, dispatchAPI);
};


exports.validatePOST = function(req, res) {
  manifestController.dispatchPOST(req, res, dispatchAPI);
};


// Expose private functions in testing environment
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    dispatchAPI   : dispatchAPI,
    index         : exports.index,
    validateGET   : exports.validateGET,
    validatePOST  : exports.validatePOST
  };
}
