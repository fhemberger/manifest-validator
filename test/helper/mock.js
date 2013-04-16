'use strict';

exports.req = {
  params : [],
  url    : '',
  header : function() { return ''; }
};

exports.res = {
  testResult     : undefined,
  callbackName   : undefined,
  HTTPStatusCode : undefined,
  HTTPHeader     : {},
  end: function(value) {
    var matches;
    this.callbackName = undefined;
    this.testResult   = undefined;

    // Try to parse result as JSON
    try {
      this.testResult = JSON.parse(value);
    } catch(e) {
      // Try to get callback name
      try {
        matches = value.match(/(.*)\(/);
      } catch(e) {
        this.testResult = value;
      }
      if (matches && matches[1]) {
        this.callbackName = matches[1];
      } else {
        // Else get plain result
        this.testResult = value;
      }
    }
  },
  local  : function() {},
  render : function(template, value) { this.end(value); },
  send   : function(value) { this.end(value); },
  status : function(value) {
    this.HTTPStatusCode = Number(value) || undefined;
    return this;
  },
  header : function(key, value) { this.HTTPHeader[key] = value; }
};