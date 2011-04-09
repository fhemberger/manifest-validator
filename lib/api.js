var formidable = require('formidable'),
	fs = require('fs');

var ManifestValidator = require('./validator.js');


function ManifestValidatorAPI(req, res, callback) {
	this.jsonp = false;
	this.callbackName;

	var self = this,
		fields = {},
		files = {};

	/**
	 * FIXME: API requires header "content-type" to be either urlencoded or multipart,
	 * so calling the API from a browser (e.g. /api/validator?directinput=CACHE MANIFEST)
	 * will fail, while curl works just fine.
	 *
	 * When "faking" the header for formidable to work, the 'field' event will not be called,
	 * thus no values are processed.
	 */
	var form = new formidable.IncomingForm();
	form
		.on('field', function(field, value) {
			if ( ['uri', 'directinput', 'callback'].indexOf(field) !== -1 && value !== '') { fields[field] = value; }

			// Legacy code for TextMate bundle
			if ( field['content'] && value !== '' ) { fields['directinput'] = value; }
		})
		.on('file', function(field, file) {
			if (field === 'upload') { files[field] = file; }
		})
		.on('error', function(err) {
			callback({
				isValid: false,
				errors : 'ERR_INVALID_API_CALL',
				message: err.message
			});
		})
		.on('end', function() {
			if (fields.callback) {
				self.jsonp = true;
				self.callbackName = (isValidFunctionName(fields.callback) ? fields.callback : 'callback');
			}
		
			if (fields.uri) {
				// URI
				self._validateUri(fields.uri, callback);
				// return;
			} else if (files.upload && files.upload.size !== 0) {
				// File Upload
				self._validateUpload(files.upload, callback);
				// return;
			} else if (fields.directinput) {
				// Direct Input
				self._validateDirectInput(fields.directinput, callback);
				// return;
			} else {
				// No valid input
				callback({
					isValid: false,
					errors : 'ERR_INVALID_API_CALL'
				});
			}
		});
	form.parse(req);
}
module.exports = ManifestValidatorAPI;


ManifestValidatorAPI.prototype._validateUri = function(uri, callback) {
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
};


ManifestValidatorAPI.prototype._validateUpload = function(upload, callback) {
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
};


ManifestValidatorAPI.prototype._validateDirectInput = function(directinput, callback) {
	var validator = new ManifestValidator();

	validator.validate(directinput);
	callback({
		isValid: (validator.errors && validator.errors.length !== 0) ? false : true,
		errors:  validator.errors
	});
};


// Based on the discussion at Stack Overflow:
// http://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
function isValidFunctionName(name) {
	var validName = /^[$A-Za-z_][0-9A-Za-z_]*$/,
		reservedWords = ['instanceof', 'typeof', 'break', 'do', 'new', 'var', 'case', 'else', 'return', 'void', 'catch', 'finally',
			'continue', 'for', 'switch', 'while', 'this', 'with', 'debugger', 'function', 'throw', 'default', 'if',
			'try', 'delete', 'in'];
	return (validName.test(name) && reservedWords.indexOf(name) === -1);
}