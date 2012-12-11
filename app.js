var express = require('express')
  , util = require('util')
  , auth = require('./auth')
  , config = require('./conf/config')
  , sessionStore = require('./data/sessionstore')
  , HttpHelper = require('./routes/httphelper');


var app = express();

console.log('Environment is ' + app.get('env'));

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // Init session management
  sessionStore.init(app);
  // Init auth
  auth.init(app);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  // Log errors
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    next(err);
  });
  // Handle all other errors 
  app.use(HttpHelper.errorHandler);
});

app.configure('production', 'stage', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear })); 
});

require('./routes/index')(app);
require('./conf/initialize')(app);

app.listen(config.getServer().port, function (){
  console.log('App listening on port '+config.getServer().port);
});
