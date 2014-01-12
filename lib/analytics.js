'use strict';

// Google Analytics
var ga_config = require('../config/google-analytics.json');
var ga        = require('ga');

var gaInstance;
if (
  ga_config.account && ga_config.account !== 'UA-xxxxxxxx-x' &&
  ga_config.host && ga_config.host !== ''
) {
  gaInstance = new ga(ga_config.account, ga_config.host);
}

module.exports.trackGA = function(userAgent) {
  if (!gaInstance) { return; }

  var uaParameter = '';
  if (userAgent && userAgent !== '') {
    uaParameter = '?user-agent=' + encodeURIComponent(userAgent);
  }

  gaInstance.trackPage('/api/validate' + uaParameter);
};

// ----------------------------------------------------------------------------

// Piwik
var pw_config    = require('../config/piwik.json');
var PiwikTracker = require('piwik-tracker');

var piwikInstance;
if (
  pw_config.siteId && pw_config.siteId !== '0' &&
  pw_config.host && pw_config.host !== ''
) {
  piwikInstance = new PiwikTracker(pw_config.siteId, pw_config.host);
}

module.exports.trackPiwik = function(req, param) {
  if (!piwikInstance) { return; }

  var source = '';
  if (param) {
    if (param.directinput) { source = 'directinput'; }
    if (param.upload)      { source = 'upload'; }
    if (param.uri)         { source = 'uri'; }
  }

  piwikInstance.track({
    url: req.app.get('baseurl') + '/api/validate',
    action_name: 'API',
    ua: req.header('User-Agent'),
    lang: req.header('Accept-Language'),
    cvar: JSON.stringify({
      '1': ['API version', 'v1'],
      '2': ['HTTP method', req.method],
      '3': ['Validation source', source],
    })
  });

};
