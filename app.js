'use strict';

var express = require('express'),
    yaml    = require('./lib/require-yaml'),
    config  = require('./lib/config.js'),
    app     = express();

var routes = {
    html: require('./routes/html.js'),
    api : require('./routes/api.js')
};

// all environments
app.set('port', config.express.port);
app.set('env', config.env);
app.set('baseurl', config.express.baseurl);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.locals = {
  lang   : yaml('./config/messages.yml'),
  config : config
};

// TODO: All middleware will be removed from Express 4.0, must be added to package.json separately
app.use(express.compress());
app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: config.express.caching.favicon }));
app.use(express.static(__dirname + '/public', { maxAge: config.express.caching.static }));
app.disable('x-powered-by');


if (config.env === 'development') {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
}

if (config.env === 'production') {
    app.use(express.logger());
    app.set('view cache');
}


// API
app.get( '/api',          routes.api.index);
app.get( '/api/validate', routes.api.validateGET);
app.post('/api/validate', routes.api.validatePOST);


// HTML
app.get( '/validate',     function(req, res) { res.redirect('/'); });
app.post('/validate',     routes.html.validate);
app.get( '/',             routes.html.index);
app.get( '*',             routes.html.error404);


var highlight = function(string) {
  return '\x1B[1m\x1B[31m' + string + '\x1B[39m';
};

var server = app.listen(app.get('port'), function() {
  console.log('[Express] Server started in %s mode, port %s', highlight(app.get('env')), highlight(app.get('port')) );
});

require('./lib/graceful-shutdown.js')(server);

// Expose application instance for testing
module.exports = app;
