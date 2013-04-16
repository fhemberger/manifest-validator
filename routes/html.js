'use strict';

var manifestController = require('../lib/manifest_controller.js'),
    lang               = require('../config/messages.json');


function dispatchWeb(req, res) {
  return function(result) {
    res.render('result', {
      view:      'result',
      lang:      lang,
      isValid:   result.isValid,
      errors:    result.errors || [],
      warnings:  result.warnings || [],
      resources: result.resources || []
    });
  };
}


exports.index = function(req, res) {
  res.render('index', {view: 'index'});
};


exports.validate = function(req, res) {
  manifestController.dispatch(dispatchWeb, req, res);
};


exports.error404 = function(req, res) {
  res.send(404, 'I’m sorry, Dave. I’m afraid I can’t do that.');
};
