'use strict';

var config       = require('config'),
    PiwikTracker = require('piwik-tracker'),
    piwikInstance;


if (
  config.analytics.enabled &&
  config.analytics.siteId && config.analytics.siteId !== '0' &&
  config.analytics.host && config.analytics.host !== ''
) {
  piwikInstance = new PiwikTracker(config.analytics.siteId, config.analytics.host);
}

function getRemoteAddr(req){
  if (req.ip) return req.ip;
  if (req._remoteAddress) return req._remoteAddress;
  var sock = req.socket;
  if (sock.socket) return sock.socket.remoteAddress;
  return sock.remoteAddress;
}

module.exports.trackPiwik = function(req, source) {
  if (!piwikInstance) { return; }

  source = source || '[not set]';

  /**
   * At the moment, Piwik only covers user agent detection for the usual
   * desktop and mobile browsers, everything else is listed as 'unknown'.
   * So the raw user agent string is also sent as custom variable.
   */
  var userAgent = req.header('User-Agent') || '[not set]';
  userAgent = /^Mozilla/.test( userAgent )
    ? '[browser]'
    : userAgent;

  var remoteAddr = getRemoteAddr(req);
  var trackParameter = {
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
  };

  if (
    config.analytics.tokenAuth && config.analytics.tokenAuth !== '' &&
    remoteAddr
  ) {
    trackParameter.token_auth = config.analytics.tokenAuth;
    trackParameter.cip = remoteAddr;
  }

  piwikInstance.track(trackParameter);

};
