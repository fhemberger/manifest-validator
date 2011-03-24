var fs = require('fs'),
	ejs = require('ejs');


var languageResources = require('./view-languages.js'),
	currentLanguage;   // Storage for current language object, set by function 'setLanguage'
	
var viewStorage = '';


exports.getAcceptedLanguages = function(req) {
	var languages = [];

	/**
	 * Example of HTTP request header 'Accept-Language' format:
	 * de,de-de;q=0.8,en;q=0.6,en-us;q=0.4,en-gb;q=0.2
	 * (where 'de' is a short form for 'de;q=1.0')
	 */
	var regexp = /(\w{2})(?:-\w{2})?/g;
	var match = regexp.exec(req);

	while (match !== null) {
		if (languages.indexOf(match[1]) === -1) { languages.push(match[1]); }
	    match = regexp.exec(req);
	}	
	return languages;
};


exports.getLanguage = function() {
	return currentLanguage;
};


exports.setLanguage = function(acceptedLanguages) {
	var lang;
	
	for (var i=0, len=acceptedLanguages.length; i < len; i++) {
		if ( languageResources.hasOwnProperty(acceptedLanguages[i]) ) { lang = acceptedLanguages[i]; break; }
	}
	
	currentLanguage = languageResources[lang || 'en'];
	return currentLanguage;
};


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
	if (!locals.lang) { locals.lang = currentLanguage; }
	return ejs.render(this.viewStorage, { locals: locals });
};


exports.renderResult = function(err, validator) {
	// Errors are either arrays (validation errors) or strings (general errors)
	return this.renderView({
		lang:      currentLanguage,
		view:      'result',
		isValid:   (err && err.length !== 0) ? false : true,
		errors:    err,
		resources: validator.invalidResources
	});
};


exports.renderJson = function(err, validator) {
	// Errors are either arrays (validation errors) or strings (general errors)
	return JSON.stringify({
		isValid:   (err && err.length !== 0) ? false : true,
		errors:    err
	});
};