exports.req = {
  params : [],
  url    : '',
  header : function(param) { return ""; }
};

exports.res = {
  testResult      : undefined,
  callbackName    : undefined,
  end: function(value) {
    this.callbackName = undefined;
    this.testResult   = undefined;

    try {
      // Try to parse result as JSON
      this.testResult = JSON.parse(value);
    } catch(e) {
      // Try to get callback name
      var matches = value.match(/(.*)\(/);
      if (matches[1]) {
        this.callbackName = matches[1];
      } else {
        // Else get plain result
        this.testResult = value;
      }
    }
  },
  local  : function() {},
  render : function(template, value) { this.end(value); },
  send   : function(value) {this.end(value); },
  header : function(a, b) {}
};