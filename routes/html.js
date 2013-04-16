'use strict';

var manifestController = require('../lib/manifest_controller.js');


exports.index = function(req, res) {
  res.render('index', {view: 'index'});
};


exports.validate = function(req, res) {
  manifestController.dispatch('web', req, res);
};


exports.error404 = function(req, res) {
  res.send(404, 'I’m sorry, Dave. I’m afraid I can’t do that.');
};
