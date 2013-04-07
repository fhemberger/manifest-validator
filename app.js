var express = require('express'),
    http   = require('http');

var routes = {
    html: require('./routes/html.js'),
    api : require('./routes/api.js')
};

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('env', process.env.NODE_ENV || 'development');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: 2592000000 }));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(app.router);


app.configure('development', function() {
  app.set('baseurl', 'http://localhost:' + app.get('port'));
  app.use(express.errorHandler());
});


app.configure('production', function() {
  app.set('baseurl', 'http://manifest-validator.com');
});


app.get( '/api',          routes.api.index);
app.get( '/api/validate', routes.api.validate);
app.post('/api/validate', routes.api.validate);

// Don't call the result page directly
app.get( '/validate',     function(req, res) { res.redirect('/'); });
app.post('/validate',     routes.html.validate);
app.get( '/',             routes.html.index);
app.get( '*',             routes.html.error404);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server in \x1B[1m\x1B[31m' + app.get('env') + '\x1B[39m, listening on port \x1B[1m\x1B[31m' + app.get('port') + '\x1B[39m');
});
