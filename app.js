'use strict';

var express = require('express'),
    app = express();

var routes = {
    html: require('./routes/html.js'),
    api : require('./routes/api.js')
};

var oneDayInMilliseconds = 86400000;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('env', process.env.NODE_ENV || 'development');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.compress());
app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: oneDayInMilliseconds * 30 }));
app.use(express.static(__dirname + '/public', { maxAge: oneDayInMilliseconds }));
app.use(app.router);
app.disable('x-powered-by');


app.configure('development', function() {
  app.set('baseurl', 'http://localhost:' + app.get('port'));
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});


app.configure('production', function() {
  app.set('baseurl', 'http://manifest-validator.com');
  app.use(express.logger());
  app.set('view cache');
});


// API
var apiMiddleware = [
  express.multipart(),
  express.urlencoded(),
  routes.api.validate
];

app.get( '/api',          routes.api.index);
app.get( '/api/validate', apiMiddleware);
app.post('/api/validate', apiMiddleware);


// HTML
// Don't call the result page directly
app.get( '/validate',     function(req, res) { res.redirect('/'); });
app.post('/validate',     express.multipart(), express.urlencoded(), routes.html.validate);
app.get( '/',             routes.html.index);
app.get( '*',             routes.html.error404);


var highlight = function(string) {
  return '\x1B[1m\x1B[31m' + string + '\x1B[39m';
};

var server = app.listen(app.get('port'), function() {
  console.log('[Express] Server started in %s mode, port %s', highlight(app.get('env')), highlight(app.get('port')) );
});


process.on('SIGTERM', function() {
  console.log('[Express] Received kill signal (SIGTERM), shutting down gracefully.');
  server.close(function() {
    console.log('[Express] Closed out remaining connections.');
    process.exit();
  });

  setTimeout(function() {
    console.error('[Express] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
});


// Expose application instance for testing
module.exports = app;

