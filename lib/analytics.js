'use strict';

var config = require('../config/google-analytics.json'),
    ga     = require('ga');


var Analytics = function() {
  this.account = config.account,
  this.host    = (config.host && config.host !== '') ? config.host : 'localhost';

  if (!this.account) {
    console.error('Analytics Error: Could not load configuration.');
    return;
  }

  this.ga = new ga(this.account, this.host);
};


Analytics.prototype.trackPage = function(userAgent) {
  var uaParameter = '';

  if (!this.ga || this.host === 'localhost') { return false; }

  if (userAgent && userAgent !== '') {
    uaParameter = '?user-agent=' + encodeURIComponent(userAgent);
  }

  return this.ga.trackPage('/api/validate' + uaParameter);
};


module.exports = ( new Analytics() );