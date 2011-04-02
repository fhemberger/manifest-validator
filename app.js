var formidable = require('formidable'),
	fs = require('fs'),
	http = require('http'),
	paperboy = require('paperboy'),
	path = require('path'),
	url = require('url'),
	util = require('util');

var ManifestValidator = require('./lib/validator.js'),
	view = require('./lib/view.js');


var SERVER_PORT    = '8735',
	SERVER_PUBLIC  = path.join(__dirname, 'public'),
	SERVER_VIEWS   = path.join(__dirname, 'views');


function log(statCode, url, ip, err) {
	var logStr = statCode + ' - ' + url + ' - ' + ip;
	if (err) { logStr += ' - ' + err; }
	console.log(logStr);
}


function startServer() {
	http.createServer(function(req, res) {
		var mode = 'html',
			contentType = 'text/html';
		

		switch( url.parse(req.url).pathname ) {

			case '/api/validate':
				mode = 'api';
			
			case '/validate':
				var fields = {},
					files = {};

				var form = new formidable.IncomingForm();
				form
					.on('field', function(field, value) {
						if ( ['uri', 'directinput', 'callback'].indexOf(field) !== -1 && value !== '') { fields[field] = value; }
					})
					.on('file', function(field, file) {
						if (field === 'upload') { files[field] = file; }
					})
					.on('end', function() {
						var validator = new ManifestValidator();

						// Set output method
						if (mode === 'api') {
							if (fields.callback) {
								mode = 'jsonp';
								contentType = 'text/javascript';
							} else {
								mode = 'json';
								contentType = 'application/json';
							}
						}
						res.writeHead(200, {'Content-Type': contentType});

						
						// URI
						if (fields.uri) {
							validator.loadFromUri(fields.uri, function(err, data) {
								if (err) {
									res.end(
										view.renderResult(mode, {errors: err})
									);
								} else {
									validator.validate(data);
									validator.checkMimeType();
									validator.checkResources(function(){
										res.end(
											view.renderResult(mode, {
												errors: validator.errors,
												resources: validator.invalidResources
											})
										);
									});
								}
							});
							return;
						}


						// File Upload
						if (files.upload && files.upload.size !== 0)
						{
							if (files.upload.type.indexOf('text/') === 0) {
								fs.readFile(files.upload.path, 'utf8', function(err, data){
									if (data) { validator.validate(data); }
									res.end(
										view.renderResult(mode, {errors: err ? 'ERR_LOAD_FILE' : validator.errors})
									);
								});
							} else {
									res.end(
										view.renderResult(mode, {errors: 'ERR_INVALID_FILE'})
									);
							}
							return;
						}


						// Direct Input
						if (fields.directinput) {
							validator.validate(fields.directinput);
							res.end(
								view.renderResult(mode, {errors: validator.errors})
							);
							return;
						}
					
						// If we reach this point, no valid parameters were passed.
						// --> There is no place like home.
						res.writeHead(302, {'Location': '/'});
						res.end();
					});
				form.parse(req);
				break;

			case '/':
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end( view.renderView({view: 'index'}) );
				break;

			default:
				paperboy
					.deliver(SERVER_PUBLIC, req, res)
					.addHeader('Expires', 300)
					.addHeader('X-PaperRoute', 'Node')
					.error(function(statCode, msg) {
						log(statCode, req.url, req.ip, msg);
					})
					.otherwise(function(err) {
						res.writeHead(404, {'Content-Type': 'text/html'});
						res.end('Error 404: File not found.<br />Back to <a href="/">Homepage</a>.');
						log(404, req.url, req.ip, err);
					});
		}

		// Process life vest. Just in case.
		process.addListener('uncaughtException', function(err) {
			util.puts('Caught exception: ' + err);
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.end('500 Internal Server Error');
		});

	}).listen(SERVER_PORT);
	util.puts('Server running at port: ' + SERVER_PORT);
}


view.loadView( path.join(SERVER_VIEWS, 'index.html'), startServer());