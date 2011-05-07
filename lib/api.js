var form = require('formidable').IncomingForm(),
	fs = require('fs');

var ManifestValidator = require('./validator.js');


function validateUri(uri, callback) {
	var validator = new ManifestValidator();

	validator.loadFromUri(uri, function(err, data) {
		if (err) {
			callback({
				isValid: false,
				errors:  err
			});
		} else {
			validator.validate(data);
			validator.checkMimeType();
			validator.checkResources(function(){
				callback({
					isValid:   (validator.errors && validator.errors.length !== 0) ? false : true,
					errors:    validator.errors,
					resources: validator.invalidResources
				});
			});
		}
	});
}


function validateUpload(upload, callback) {
	var validator = new ManifestValidator();
	
	if (upload.type.indexOf('text/') === 0) {
		fs.readFile(upload.path, 'utf8', function(err, data) {
			if (data) { validator.validate(data); }
			var errors = err ? 'ERR_LOAD_FILE' : validator.errors;
			callback({
				isValid: (errors && errors.length !== 0) ? false : true,
				errors: errors
			});
		});
	} else {
		callback({
			isValid: false,
			errors: 'ERR_INVALID_FILE'
		});
	}
}


function validateDirectInput(directinput, callback) {
	var validator = new ManifestValidator();

	validator.validate(directinput);
	callback({
		isValid: (validator.errors && validator.errors.length !== 0) ? false : true,
		errors:  validator.errors
	});
}


// Based on this discussion at Stack Overflow:
// http://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
function isValidFunctionName(name) {
	var validName = /^[$A-Za-z_][0-9A-Za-z_]*$/,
		reservedWords = ['instanceof', 'typeof', 'break', 'do', 'new', 'var', 'case', 'else', 'return', 'void', 'catch', 'finally',
			'continue', 'for', 'switch', 'while', 'this', 'with', 'debugger', 'function', 'throw', 'default', 'if',
			'try', 'delete', 'in'];
	return (validName.test(name) && reservedWords.indexOf(name) === -1);
}


function ManifestValidatorAPI() {
	this._jsonp = false;
	this._jsonpCallbackName = '';
	this._callback = null;
}


ManifestValidatorAPI.prototype.parse = function(req, callback) {
	var self = this;

	self._callback = callback;
	form.parse(req, function(err, fields, files) {

		if (fields.callback) {
			self._jsonp = true;
			self._jsonpCallbackName = (isValidFunctionName(fields.callback) ? fields.callback : 'callback');
		} else {
			self._jsonp = false;
			self._jsonpCallbackName = '';
		}

		if (!self._callback || typeof self._callback !== 'function') { throw 'no callback specified.'; }
		if (fields.uri && fields.uri !== '') {
			// URI
			validateUri(fields.uri, self._callback);
		} else if (files.upload && files.upload.size && files.upload.size !== 0) {
			// File Upload
			validateUpload(files.upload, self._callback);
		} else if (fields.directinput && fields.directinput !== '') {
			// Direct Input
			validateDirectInput(fields.directinput, self._callback);
		} else {
			// No valid input
			self._callback({
				isValid: false,
				errors : 'ERR_INVALID_API_CALL'
			});
		}
	});
};


ManifestValidatorAPI.prototype.isJSONP = function() {
	return this._jsonp;
};


ManifestValidatorAPI.prototype.getJSONPCallbackName = function() {
	return this._jsonpCallbackName;
};

module.exports = new ManifestValidatorAPI();
