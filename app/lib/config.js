'use strict';

var extend = require('extend'),
    yaml   = require('./require-yaml');

var environment   = process.env.NODE_ENV || 'development',
    defaultConfig = yaml('../config/default.yml'),
    environmentConfig = {};

try {
  environmentConfig = yaml('../config/' + environment + '.yml');
} catch(e) {}

module.exports = extend(true, { env: environment }, defaultConfig, environmentConfig);
