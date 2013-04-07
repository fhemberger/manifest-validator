var manifestController = require('../lib/manifest_controller.js');


exports.index = function(req, res) {
  res.send("respond with a resource");
};


exports.validate = function(req, res) {
  manifestController.dispatch('api', req, res);
};