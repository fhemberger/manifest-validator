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
	return ejs.render(this.viewStorage, { locals: locals });
};


exports.renderResult = function(mode, res) {
	// Errors are either arrays (validation errors) or strings (general errors)
	var result = {
		isValid:   (res.errors && res.errors.length !== 0) ? false : true,
		errors:    res.errors,
		resources: res.resources
	};
	
	if (mode === 'html') {
		result.view = 'result';
		return this.renderView(result);
	} else {
		result = JSON.stringify(result);
		if (mode === 'jsonp') {

			// TODO: API should check for valid function name for JSONP, see: http://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
			functionName = (res.callback) ? res.callback : 'callback';
			return functionName + '(' + result + ')';
		} else {
			return result;
		}
	}
};