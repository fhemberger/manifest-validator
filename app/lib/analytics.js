'use strict';
/* eslint-disable camelcase */

const Config       = require('ez-config');
const PiwikTracker = require('piwik-tracker');


const internals = {};

internals.getRemoteAddr = function (req) {

    if (!req)               { return; }
    if (req.ip)             { return req.ip; }
    if (req._remoteAddress) { return req._remoteAddress; }
    if (!req.socket)        { return; }
    if (req.socket.socket)  { return req.socket.socket.remoteAddress; }
    return req.socket.remoteAddress;
};


if (Config.get('analytics.enabled')) {
    internals.piwikInstance = new PiwikTracker(Config.get('analytics.siteId'), `${Config.get('analytics.host')}/piwik.php`);
}


module.exports.trackPiwik = function (req, source) {

    if (!internals.piwikInstance) { return; }

    source = source || '[not set]';

    /**
     * At the moment, Piwik only covers user agent detection for the usual
     * desktop and mobile browsers, everything else is listed as 'unknown'.
     * So the raw user agent string is also sent as custom variable.
     */
    var userAgent = req.headers['user-agent'] || '[not set]';
    userAgent = /^Mozilla/.test( userAgent )
        ? '[browser]'
        : userAgent;

    var remoteAddr = internals.getRemoteAddr(req);
    var trackParameter = {
        url         : `${Config.get('server.baseUrl')}/api/validate`,
        action_name : 'API',
        ua          : req.headers['user-agent'],
        lang        : req.headers['accept-language'],
        cvar        : JSON.stringify({
            '1': ['API version',       'v1'],
            '2': ['HTTP method',       req.method],
            '3': ['Validation source', source],
            '4': ['User-Agent',        userAgent]
        })
    };

    if (
        Config.get('analytics.tokenAuth') && Config.get('analytics.tokenAuth') !== '' &&
        remoteAddr
    ) {
        trackParameter.token_auth = Config.get('analytics.tokenAuth');
        trackParameter.cip = remoteAddr;
    }

    internals.piwikInstance.track(trackParameter);
};
