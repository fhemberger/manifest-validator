var formidable = require('formidable'),
	fs = require('fs'),
	http = require('http'),
	paperboy = require('paperboy'),
	path = require('path'),
	url = require('url'),
	util = require('util');
	
var validator = require('./lib/validator.js'),
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
	var form = new formidable.IncomingForm();
	
	http.createServer(function(req, res) {

		var path = url.parse(req.url).pathname;

		if ( !view.getLanguage() ) {
			view.setLanguage( view.getAcceptedLanguages(req.headers['accept-language']) );
		}

		switch(path) {

			case '/api/validate':
				try {
					form.parse(req, function(err, fields, files) {

						var mimeType = (fields.callback && fields.callback !== '') ? 'text/javascript' : 'application/json';
				
						// URI
						if (fields.uri && fields.uri !== '') {
							console.log('uri');
							res.writeHead(200, {'Content-Type': mimeType});
						
							validator.loadFromUri(fields.uri, function(err, data) {
								if (err) {
									res.end(
										view.renderResult(err, validator)
									);
								} else {
									validator.validate(data);
									validator.checkMimeType();
									validator.checkResources(function(){
										res.end(
											view.renderResult(validator.errors, validator)
										);
									});
								}
							});
							return;
						}

						// Direct Input
						if (fields.content && fields.content !== '') {
							console.log('api');
							validator.validate(fields.content);
							// if (fields.callback) {
								res.writeHead(200, {'Content-Type': mimeType});
								res.end(
									view.renderJson(validator.errors, validator)
								);
							// }
							return;
						}
						// If we reach this point, something failed.
						res.writeHead(404, {'Content-Type': 'text/html'});
						res.end('Error 404: Please use correct API parameters. See <a href="/">Homepage</a> for details.');
						
					});
				} catch (e) {
					console.log(e);
				}
				break;
			
			case '/validate':

				// We don't serve you kind
				if (req.method !== 'POST') {
					res.writeHead(302, {'Location': '/'});
					res.end();
					return;
				}
				try {
					form.parse(req, function(err, fields, files) {
						// URI
						if (fields.uri && fields.uri !== '') {
							console.log('uri');
							res.writeHead(200, {'Content-Type': 'text/html'});
						
							validator.loadFromUri(fields.uri, function(err, data) {
								if (err) {
									res.end(
										view.renderResult(err, validator)
									);
								} else {
									validator.validate(data);
									validator.checkMimeType();
									validator.checkResources(function(){
										res.end(
											view.renderResult(validator.errors, validator)
										);
									});
								}
							});
							return;
						}


						// File Upload
						if (files.file && files.file.size !== 0 && files.file.type.indexOf('text/') === 0) {
							console.log('upload');
							res.writeHead(200, {'Content-Type': 'text/html'});
					
							fs.readFile(files.file.path, 'utf8', function(err, data){
								if (data) { validator.validate(data); }
								res.end(
									view.renderResult(err ? 'ERR_LOAD_FILE' : validator.errors, validator)
								);
							});
							return;
						}


						// Direct Input
						if (fields.content && fields.content !== '') {
							console.log('direct input');
							validator.validate(fields.content);
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.end(
								view.renderResult(validator.errors, validator)
							);
							return;
						}
					
						// If we reach this point, something failed.
						res.writeHead(302, {'Location': '/'});
						res.end();
					});
				} catch (e) {
					console.log(e);
				}
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

	}).listen(SERVER_PORT);
	util.puts('Server running at port: ' + SERVER_PORT);
}


view.loadView( path.join(SERVER_VIEWS, 'index.html'), startServer());