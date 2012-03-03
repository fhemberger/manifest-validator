/*jshint node:true, strict:false */

var express            = require('express'),
    form               = require('connect-form'),
    manifestController = require('./lib/manifest_controller.js');


var app = module.exports = express.createServer(
  form({ keepExtensions: true })
);


// Configuration
app.configure(function() {
  app.set('basepath', 'http://manifest-validator.com');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});


// -- Routes ------------------------------------------------------------------
// POST: Form & API
app.post(/^(\/api)?\/validate/, function(req, res) {
  var output = (req.params && req.params[0]) ? 'api' : 'web';
  manifestController.dispatch(output, req, res);
});

// GET: API
app.get('/api/validate', function(req, res) {
  manifestController.dispatch('api', req, res);
});

// Don't call the result page directly
app.get('/validate', function(req, res) {
  redirect('/');
});

app.get('/', function(req, res) {
  res.render('index', {view: 'index'});
});

app.get('*', function(req, res) {
  res.redirect('/');
});

app.listen(8735);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
