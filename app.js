var express = require('express'),
    form = require('connect-form');

var api = require('./lib/api.js');


var app = module.exports = express.createServer(
  form({ keepExtensions: true })
);


// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function() {
  app.use(express.errorHandler()); 
});


// Routes
app.post(/^(\/api)?\/validate/, function(req, res) {
  api.dispatch(req, res);
});

app.get(/^(\/api)?\/validate/, function(req, res) {
  if (req.params[0] === '/api') { api.dispatch(req, res); return; }
  res.redirect('/');
});

app.get('/', function(req, res) {
  res.render('index', {view: 'index'});
});


app.listen(8735);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
