var	ejs = require('ejs'),
	fs = require('fs'),
	lang = require('../views/lang');

var viewStorage = '';


exports.loadView = function(file, callback) {
	var view = this;
	fs.readFile(file, 'utf8', function (err, data) {
		if (err) { throw 'Error loading view: ' + err; }
		view.viewStorage = data;
		if (typeof callback === 'function') { callback.call(this); }
	});
};


exports.renderView = function(locals) {
	if (!this.viewStorage) { throw 'No view loaded.'; }
	if (!locals.lang) { locals.lang = lang; }
	if (!locals.resources) { locals.resources = {}; }

	return ejs.render(this.viewStorage, { locals: locals });
};
