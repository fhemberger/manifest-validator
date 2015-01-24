'use strict';

var express = require('express'),
    config  = require('config'),
    app     = express();

var routes = {
    html: require('./routes/html.js'),
    api : require('./routes/api.js')
};

// all environments
app.set('port',        process.env.PORT || config.express.port || 3000);
app.set('env',         process.env.NODE_ENV || config.env || 'development');
app.set('baseurl',     config.express.baseurl);
app.set('views',       __dirname + '/views');
app.set('view engine', 'jade');
app.disable('x-powered-by');

app.locals = {
  lang   : require('../config/messages.json'),
  config : config
};


// TODO: All middleware will be removed from Express 4.0, must be added to package.json separately
app.use(express.compress());
app.use(express.favicon('public/favicon.ico', { maxAge: config.express.caching.favicon }));
app.use(express.static('public', { maxAge: config.express.caching.static }));


if (config.logging.access.enabled) {
  app.use(express.logger({
    format: config.logging.access.format || 'default'
  }));
}

if (config.env === 'development') {
    app.use(express.errorHandler());
}

if (config.env === 'production') {
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
