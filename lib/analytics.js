'use strict';

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

  var source = '[not set]';
  if (param) {
    if ('directinput' in param) { source = 'directinput'; }
    if ('upload' in param)      { source = 'upload'; }
    if ('uri' in param)         { source = 'uri'; }
  }

  /**
   * At the moment, Piwik only covers user agent detection for the usual
   * desktop and mobile browsers, everything else is listed as 'unknown'.
   * So the raw user agent string is also sent as custom variable.
   */
  var userAgent = req.header('User-Agent') || '[not set]';
  userAgent = /^Mozilla/.test( userAgent )
    ? '[browser]'
    : userAgent;

  piwikInstance.track({
    url: req.app.get('baseurl') + '/api/validate',
    action_name: 'API',
    ua: req.header('User-Agent'),
    lang: req.header('Accept-Language'),
    cvar: JSON.stringify({
      '1': ['API version', 'v1'],
      '2': ['HTTP method', req.method],
      '3': ['Validation source', source],
      '4': ['User-Agent', userAgent]
    })
  });

};
