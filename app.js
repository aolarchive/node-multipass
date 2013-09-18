var express = require('express')
  , cluster = require('cluster')
  , util = require('util')
  , path = require('path')
  , accesslog = require('./conf/accesslog')
  , auth = require('./auth')
  , config = require('./conf/config')
  , sessionStore = require('./data/sessionstore')
  , initialize = require('./conf/initialize')
  , nstest = require('nstest')
  , HttpHelper = require('./routes/httphelper');


var debugMode = typeof global.v8debug != 'undefined',
	clusterEnabled = !debugMode && config.cluster && config.cluster.enabled,
	numCPUs = require('os').cpus().length,
	numWorkers = config.cluster && config.cluster.workers ? Math.min(numCPUs, config.cluster.workers) : numCPUs;

if (clusterEnabled && cluster.isMaster) {
	// Fork workers
	for (var i = 0; i < numWorkers; i++) {
		cluster.fork();
	};
	// In case the worker dies
	cluster.on('exit', function(worker, code, signal) {
	  console.log('Worker ' + worker.process.pid + ' died');
	});
	// As workers come up
	cluster.on('listening', function(worker, address) {
	  console.log("A worker with #"+worker.id+" is now connected to " + address.address + ":" + address.port);
	});
	
} else {
	var app = express();
	
	console.log('Environment is ' + app.get('env'));
	
	// configure Express
	app.configure(function() {
		
	  // Setup logging
	  var logOptions = {
	  	logFile: false,
	  	format: 'dev',
	  	ready: function (options) {
				if (options.logFile) {
					app.set('logFile', options.logFile);
					console.log('Logging to ' + app.get('logFile'));
				} else {
					console.log('Logging to STDOUT');
				}
			}
	  };
	  app.configure('production', 'stage', function () {
	  	logOptions.logFile = path.resolve(config.logging && config.logging.accessLog);
	  	logOptions.format = 'argus';
	  });
	  app.use(accesslog.logger(app, logOptions));
	  
		// Setup views
	  app.set('views', __dirname + '/');
	  app.set('view engine', 'ejs');
	  
	  // Setup middleware
	  app.use(express.cookieParser());
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  
	  // Trust proxy if exists
	  if (config.hasProxy()) {
	    app.enable('trust proxy');
	  }
	  
	  // Init session management
	  sessionStore.init(app);
	  
	  // Init auth
	  auth.init(app);
	  
	  // Router setup
	  app.use(app.router);
	  app.use(express.static(__dirname + '/public'));
	  
	  // Log errors
	  app.use(function(err, req, res, next) {
	    console.error(err.stack);
	    next(err);
	  });
	  // Handle all other errors 
	  app.use(HttpHelper.errorHandler);
	  
	  // Healthcheck handler
  	app.use(nstest.healthcheck({
    	doc_root: __dirname + '/public',
    	ok_text: 'Multipass ok',
    	error_text: 'Multipass error'
    }));
	});
	
	app.configure('production', 'stage', function(){
	  var oneYear = 31557600000;
	  app.use(express.static(__dirname + '/public', { maxAge: oneYear })); 
	});
	
	initialize.init(app);
	
	app.listen(config.getServer().port, function (){
	  console.log('App listening on port '+config.getServer().port);
	});
}