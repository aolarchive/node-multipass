var config = require('./config')
	, express = require('express')
	, path = require('path')
	, fs = require('fs')
	, moment = require('moment')
	, microtime = require('microtime');


function init(app) {

  app.set('logFile', path.resolve(config.logging && config.logging.accessLog || __dirname + '/logs/access.log'));
	
  app.use(function (req, res, next) {
  	req._startTimeMicro = microtime.now();
  	next();
  });
  
	express.logger.token('response-time-micro', function(req) {
  	return microtime.now() - req._startTimeMicro;
	});
	
	express.logger.token('username', function (req) {
		return null;
  	/*if (req.session) {
  		return req.session.user || req.session.id;
  	} else {
  		return null;
  	}*/
  });
  
  express.logger.token('protocol', function (req) {
		return String(req.protocol).toUpperCase();
  });
  
  express.logger.token('date', function() {
  	return moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
	});
	
  express.logger.format('argus', ':remote-addr - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] :response-time-micro ":user-agent"');
  
  express.logger.format('combined', ':remote-addr - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
  
  switch (app.get('env')) {
  	case 'production':
  	case 'stage':
  		var logStream = fs.createWriteStream(app.get('logFile'), {flags: 'a'});
  		logStream.on('error', function (error) {
  			console.log(error);
  		});
  		app.use(express.logger({
  			format:'argus',
  			stream: logStream
  		}));
  		console.log('Logging to ' + app.get('logFile'));
  		break;
  	default: 
  		app.use(express.logger('dev'));
  		console.log('Logging to STDOUT');
  		break;
  }
  
}

module.exports.init = init;