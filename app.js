var express = require('express'),
    http    = require('http');

var routes = {
    html: require('./routes/html.js'),
    api : require('./routes/api.js')
};

var oneDayInMilliseconds = 86400000;

var app = express();

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


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server in \x1B[1m\x1B[31m' + app.get('env') + '\x1B[39m, listening on port \x1B[1m\x1B[31m' + app.get('port') + '\x1B[39m');
});

process.on('SIGTERM', function() {
  console.log('Received kill signal (SIGTERM), shutting down gracefully.');
  server.close(function() {
    console.log('Closed out remaining connections.');
    process.exit();
  });

  setTimeout(function() {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
});
