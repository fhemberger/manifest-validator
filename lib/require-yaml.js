'use strict';

var yaml   = require('js-yaml'),
    path   = require('path'),
    fs     = require('fs');

module.exports = function(filename) {
  var filepath = path.join(__dirname, '..', filename);
  return yaml.safeLoad(fs.readFileSync(filepath, 'utf-8'));
};
