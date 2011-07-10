var	http = require('http'),
	paperboy = require('paperboy'),
	path = require('path'),
	url = require('url'),
	util = require('util');

var api = require('./lib/api.js'),	
	view = require('./lib/view.js');


var SERVER_PORT    = '8735',
	SERVER_PUBLIC  = path.join(__dirname, 'public'),
	SERVER_VIEWS   = path.join(__dirname, 'views');


// Process life vest. Just in case.
var httpResponse = null;
process.addListener('uncaughtException', function(err) {
	log(500, err);
	if (httpResponse !== null) {
		httpResponse.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
		httpResponse.end('500 Internal Server Error');
	}
});


function log(statusCode, message) {
	util.log( statusCode + ' - ' + Array.isArray(message) ? message.join(' - ') : message );
}


function startServer() {
	http.createServer(function(req, res) {
		var self = this,
			mode = 'html';

		httpResponse = res;

		switch( url.parse(req.url).pathname ) {

			case '/api/validate':
				mode = 'json';
			
			case '/validate':

				api.parse(req, function(result) {
						var contentType = 'text/html',
						body = '';
						
					switch (mode) {
						case 'html':
							result.view = 'result';
							body = view.renderView(result);
							break;

						case 'json':
							contentType = 'application/json';
							body = JSON.stringify(result);
							if (!api.isJSONP()) { break; }

						case 'jsonp':
							contentType = 'text/javascript';
							body = api.getJSONPCallbackName() + '(' + body + ')';
							break;
					}

					res.writeHead(200, {
						'Content-Type': contentType + '; charset=utf-8',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': 'X-Requested-With'
					});
					res.end(body);
				});
				break;

			case '/':
				res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
				res.end( view.renderView({view: 'index'}) );
				break;

			default:
				paperboy
					.deliver(SERVER_PUBLIC, req, res)
					.addHeader('Expires', 300)
					.addHeader('X-PaperRoute', 'Node')
					.error(function(statCode, msg) {
						log(statCode, [req.url, req.ip, msg]);
					})
					.otherwise(function(err) {
						res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
						res.end('Error 404: File not found.<br />Back to <a href="/">Homepage</a>.');
						log(404, [req.url, req.ip, err]);
					});
		}


	}).listen(SERVER_PORT);
	util.puts('Server running at port: ' + SERVER_PORT);
}


view.loadView( path.join(SERVER_VIEWS, 'index.html'), startServer());