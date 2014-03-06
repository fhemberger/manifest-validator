'use strict';

var manifestController = require('../lib/manifest_controller.js');

function dispatchWeb(req, res) {
  return function(validationResponse) {
    res.render('result', {
      view             : 'result',
      result : validationResponse.result
    }, function(err, html) {
      var status = validationResponse.statusCode || 200;
      if (status !== 200) {
        res.header('Connection', 'close');
      }
      res.send(status, html);
    });

  };
}


exports.index = function(req, res) {
  res.render('index', {view: 'index'});
};


exports.validate = function(req, res) {
  manifestController.dispatchPOST(req, res, dispatchWeb);
};


exports.error404 = function(req, res) {
  res.send(404, 'I’m sorry, Dave. I’m afraid I can’t do that.');
};
