var express = require('express')
	, path = require('path')
	, fs = require('fs')
	, moment = require('moment')
	, microtime = require('microtime');


module.exports.logger = function (app, options) {

	options = options || {};
	options.logFile = options.logFile === false ? null : 
		(path.resolve(options.logFile || __dirname + '/logs/access.log'));
	options.format = options.format || 'default';
	options.ready = options.ready || null;
	options.error = options.error || null;
	
	var logStream = null;
	
	if (app) {
	  app.use(function (req, res, next) {
	  	req._startTimeMicro = microtime.now();
	  	next();
	  });
	}
  
  /*
   * Define new tokens
   */
  
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
		return req.protocol;
  });
  
  express.logger.token('date', function(req) {
  	return moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
	});
	
	/*
	 * Define new formats
	 */
	
  express.logger.format('argus', ':remote-addr - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] :response-time-micro ":user-agent"');
  
  express.logger.format('combined', ':remote-addr - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
  
  
  // Set up file stream, if needed
  if (options.logFile) {
  	var logStream = fs.createWriteStream(options.logFile, {flags: 'a'});
		logStream.on('error', function (error) {
			// Execute 'error' callback
			if (options.error && typeof options.error === 'function') {
				options.error(error);
			} else {
				console.log(error);
			}
		});
		options.stream = logStream;
  }
  
  // Execute 'ready' callback
  if (options.ready && typeof options.ready === 'function') {
  	options.ready(options);
  }
  
  return express.logger(options);
  
};
