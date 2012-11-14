var express = require('express')
  , util = require('util')
  , auth = require('./auth')
  , config = require('./conf/config');


var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.session({ secret: config.session.secret }));
  auth.init(app);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('production', 'stage', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname, 'public', { maxAge: oneYear }));
  app.use(express.errorHandler()); 
});

require('./routes/index')(app);
require('./conf/initialize')(app);

app.listen(config.port, function (){
  console.log('App listening on port '+config.port);
});
