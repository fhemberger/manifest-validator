var http = require('http'),
	path = require('path'),
	url = require('url'),
	util = require('util');


// -- Helper functions --------------------------------------------------------
function stringToArray(fileContents) {
	if ( typeof fileContents !== 'string' ) { return []; }

	// In case of a Windows file, remove CRs first
	fileContents = fileContents.replace(/\r/g, '');
	return fileContents.split('\n');
}


function isValidUrl(url) {
	// Revenge of the killer RegExp!
	// Found at http://regexlib.com/RETester.aspx?regexp_id=501
	// console.log(url);
	
	var validUrl = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
	
	// console.log( validUrl.test(url) );
	return validUrl.test(url);
}


Array.prototype.diff = function(a) {
    return this.filter(function(i) { return (a.indexOf(i) === -1); });
};


// -- ... ---------------------------------------------------------------------
var ManifestValidator = function() {
	this.errors    = [];
	this.resources = [];
	this.invalidResources = [];
	this.baseUrl   = 'http://127.0.0.1/';
	this.mimeType  = '';
};


ManifestValidator.prototype.loadFromUri = function(manifestUri, callback) {
	var self = this,
		uri = url.parse(manifestUri),
		options = {
			host: uri.hostname,
			port: uri.port || (uri.protocol === 'http:' ? 80 : 443),
			path: uri.pathname
		};

	http.get(options, function(res) {
		var err;
		if (res.statusCode === 200) {
			res.setEncoding('utf8');
			res.on('data', function (data) {
				self.mimeType = res.headers['content-type'];
				self.baseUrl  = uri.href.substring(0, uri.href.lastIndexOf('/') + 1);
				callback(err, data);
			});
		} else {
			callback('ERR_LOAD_URI');
		}
	}).on('error', function(err) {
		callback(err);
	});
};



ManifestValidator.prototype.checkMimeType = function() {
	if (this.mimeType === 'text/cache-manifest') { return true; }
	this.errors[0] = { error: 'ERR_MANIFEST_MIMETYPE' };
	return false;
};


ManifestValidator.prototype.checkResources = function(callback) {
	if (this.resources.length === 0) {
		callback();
		return;
	}

	var baseUrl = this.baseUrl,
		resources = this.resources,
		invalidUrls = [],
		req, res, resource, options, i,
		semaphore = 0,
		self = this;

	function processRequest(res) {
		if ( [200, 301, 302, 307].indexOf(res.statusCode) === -1 ) {
			invalidUrls.push( url.resolve('http://' + res.connection._httpMessage.agent.host, res.connection._httpMessage.path) );
		}
		semaphore--;

		// Proceed if semaphore is finished
		if (!semaphore) {
			self.invalidResources = invalidUrls;
			callback();
		}
	}

	for (i in resources) {
		semaphore++;

		resource = url.parse( url.resolve(baseUrl, resources[i]) );
		options = {
			host: resource.hostname,
			port: resource.port || (resource.protocol === 'http:' ? 80 : 443),
			path: resource.pathname,
			method: 'HEAD'
		};

		req = http.request(options, processRequest);
		req.end();
	}
};


ManifestValidator.prototype.validate = function(manifestInput) {
	var baseUrl = this.baseUrl,
		manifest = stringToArray(manifestInput),
		errors = [], resources = [],
		parsingMode = 'explicit',
		isValidResource = true;

	var i = 0, lines = manifest.length,
		absoluteUrl, firstUrl, token;


	// Check empty file
	if (lines === 0) {
		errors[0] = { error: 'ERR_EMPTY_FILE' };

		this.errors = errors;
		this.resources = resources;
		return false;
	}


	// Check manifest signature
	if (manifest[0] !== "CACHE MANIFEST") {
		errors[0] = {
			error:   'ERR_MANIFEST_HEADER',
			content: manifest[0]
		};

		this.errors = errors;
		this.resources = resources;
		return false;
	}


	while (i++ < lines-1) {
		// Trim whitespaces
		manifest[i] = manifest[i].replace(/^[ \t]+|[ \t]+$/, '');
		

		// Ignore empty lines and comments
		if ( /^(#.*)?$/.test(manifest[i]) ) { continue; }


		// Comments after url tokens are invalid
		if ( /\s+#.*?$/.test(manifest[i]) ) {
			errors[i] = {
				error:   'ERR_MANIFEST_INVALID_RESOURCE',
				content: manifest[i]
			};
			continue;
		}


		// Check for parsing mode changes
		if (manifest[i] === 'CACHE:')    { parsingMode = 'explicit'; continue; }
		if (manifest[i] === 'FALLBACK:') { parsingMode = 'fallback'; continue; }
		if (manifest[i] === 'NETWORK:')  { parsingMode = 'whitelist'; continue; }


		// Now we're talking URL business
		switch (parsingMode) {
			case 'explicit':
				absoluteUrl     = url.resolve(baseUrl, manifest[i]);
				isValidResource = isValidUrl(absoluteUrl);
				break;

			case 'fallback':
				token = manifest[i].split(/[ \t]/);
				if (token.length != 2) {
					isValidResource = false;
					break;
				}	

				firstUrl        = url.resolve(baseUrl, token[0]);
				absoluteUrl     = url.resolve(baseUrl, token[1]);
				isValidResource = isValidUrl(firstUrl) && isValidUrl(absoluteUrl);
				break;

			case 'whitelist':
				if ( manifest[i].indexOf('*') !== 0 ) {
					absoluteUrl     = url.resolve(baseUrl, manifest[i]);
					isValidResource = isValidUrl(absoluteUrl);
				}
				break;
		}

		// Push the results to the corresponding arrays
		if ( isValidResource ) {
			resources[i] = absoluteUrl;
		} else {
			errors[i] = {
				error:   'ERR_MANIFEST_INVALID_RESOURCE',
				content: manifest[i]
			};
			isValidResource = true;
		}
	}
	
	this.errors = errors;
	this.resources = resources;
	return (errors.length === 0);
};


module.exports = new ManifestValidator();