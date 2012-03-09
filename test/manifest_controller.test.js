var nodeunit = require('nodeunit'),
    manifestController = require('../lib/manifest_controller.js');

var ASYNC_TIMEOUT = 2000;


// -- Mockups -----------------------------------------------------------------
var _req = {
  params: [],
  url: '',
  header: function(param) { return ""; }
};

var _res = {
  testResult: {},
  local: function() {},
  render: function(template, value) {
    this.testResult = JSON.parse(value);
  },
  end: function(value) {
    // Return either Object or JSONP function name
    try {
      this.testResult = JSON.parse(value);
    } catch(e) {
      matches = value.match(/(.*)\(/);
      if (matches[1]) { this.testResult = matches[1]; }
    }
  },
  send: function(value) {
    if (typeof value == 'number') {
      this.testResult = value;
      return;
    }
    this.end(value);
  },
  header: function(a, b) {}
};

var logMethod = global.console.log;
global.console.log = function(){
  if (arguments[0] == 'API call:') { return; }
  logMethod.apply(this, arguments);
};


// -- Tests -------------------------------------------------------------------
exports['Invalid call'] = {
  'No parameter': function(test) {
    var req=_req, res=_res;

    manifestController.dispatch('api', req, res);
    test.equal(res.testResult, 400);
    test.done();
  },

  'Unknown parameter': function(test) {
    var req=_req, res=_res;
    req.body = { unknownparameter: true };

    manifestController.dispatch('api', req, res);
    test.equal(res.testResult, 400);
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['URI'] =  {
  'Invalid URI': function(test) {
    var req=_req, res=_res;
    req.body = { uri: 'http://www.example.com/' };
    req.form = undefined;

    manifestController.dispatch('api', req, res);
    setTimeout(function() {
      test.equal(res.testResult.isValid, false);
      test.done();
    }, ASYNC_TIMEOUT);
  },

  'Valid URI: Tested in manifest.test.js': function(test) {
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['Direct input'] = {
  'Invalid manifest': function(test) {
    var req=_req, res=_res;
    req.body = { directinput: 'INVALID CACHE MANIFEST' };
    req.form = undefined;

    manifestController.dispatch('api', req, res);
    test.equal(res.testResult.isValid, false);
    test.done();
  },

  'Valid manifest': function(test) {
    var req=_req, res=_res;
    req.body = { directinput: "CACHE MANIFEST" };
    req.form = undefined;

    manifestController.dispatch('api', req, res);
    test.equal(res.testResult.isValid, true);
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['JSONP callback'] = {
  'Invalid callback name, falling back to default': function(test) {
    var req=_req, res=_res;
    req.body = {
      callback: 'this',
      directinput: "CACHE MANIFEST"
    };
    req.form = undefined;

    manifestController.dispatch('api', req, res);
    test.equal(res.testResult, 'callback');
    test.done();
  },

  'Valid callback name': function(test) {
    var req=_req, res=_res;
    req.body = {
      callback: 'myCallbackName',
      directinput: "CACHE MANIFEST"
    };
    req.form = undefined;

    manifestController.dispatch('api', req, res);
    test.equal(res.testResult, req.body.callback);
    test.done();
  }
};
