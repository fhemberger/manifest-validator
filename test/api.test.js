var nodeunit = require('nodeunit'),
    api = require('../lib/api.js');

var ASYNC_TIMEOUT = 1000;


// -- Mockups -----------------------------------------------------------------
var _req = {
  params: []
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
  header: function(a, b) {}
};


// -- Tests -------------------------------------------------------------------
exports['Invalid call'] = {
  'No parameter': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';

    api.dispatch(req, res);
    test.equal(res.testResult.errors, "ERR_INVALID_API_CALL");
    test.done();
  },
  
  'Unknown parameter': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';
    req.body = { unknownparameter: true };

    api.dispatch(req, res);
    test.equal(res.testResult.errors, "ERR_INVALID_API_CALL");
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['URI'] =  {
  'Invalid URI': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';
    req.body = { uri: 'http://www.example.com/' };
    req.form = undefined;

    api.dispatch(req, res);
    setTimeout(function() {
      test.equal(res.testResult.isValid, false);
      test.done();
    }, ASYNC_TIMEOUT);
  },

  'Valid URI: Tested in validator.test.js': function(test) {
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['Upload'] = {
  'Invalid file': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';
    req.body = undefined;
    req.form = {
      complete: function(callback) {callback(true); }
    };

    api.dispatch(req, res);
    test.equal(res.testResult.isValid, false);
    test.equal(res.testResult.errors, 'ERR_INVALID_FILE');
    test.done();
  },

  'Valid file: Tested in validator.test.js': function(test) {
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['Direct input'] = {
  'Invalid manifest': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';
    req.body = { directinput: 'INVALID CACHE MANIFEST' };
    req.form = undefined;

    api.dispatch(req, res);
    test.equal(res.testResult.isValid, false);
    test.done();
  },
  
  'Valid manifest': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';
    req.body = { directinput: "CACHE MANIFEST" };
    req.form = undefined;

    api.dispatch(req, res);
    test.equal(res.testResult.isValid, true);
    test.done();
  }
};


// ----------------------------------------------------------------------------
exports['JSONP callback'] = {
  'Invalid callback name, falling back to default': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';
    req.body = {
      callback: 'this',
      directinput: "CACHE MANIFEST"
    };
    req.form = undefined;

    api.dispatch(req, res);
    test.equal(res.testResult, 'callback');
    test.done();
  },

  'Valid callback name': function(test) {
    var req=_req, res=_res;
    req.params[0] = '/api';
    req.body = {
      callback: 'myCallbackName',
      directinput: "CACHE MANIFEST"
    };
    req.form = undefined;

    api.dispatch(req, res);
    test.equal(res.testResult, req.body.callback);
    test.done();
  }
};
