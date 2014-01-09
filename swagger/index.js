var express = require('express')
	, swagger = require('swagger-node-express')
	, config = require('../conf/config')
	, models = require('./models')
	, resources = require('./resources');


/**
 * Add resources automatically based on their spec.method
 */
function addResources (resources) {
	Object.keys(resources).forEach(function (key) {
		var resource = resources[key];
		switch(resource.spec.method) {
			case 'GET':
				swagger.addGet(resource);
				break;
			case 'DELETE':
				swagger.addDelete(resource);
				break;
			case 'PUT':
				swagger.addPut(resource);
				break;
			case 'POST':
				swagger.addPost(resource);
				break;
		}
	});
};

/**
 * Initialize the swagger docs
 */
function init (app) {

 	swagger.setAppHandler(app);

	// Add models 
	swagger.addModels(models);
	
	// Add resources
	addResources(resources);

	swagger.setApiInfo({
	  title: "Multipass API",
	  description: "Multipass is a RESTful web service that authenticates users with various accounts (Facebook, Twitter, Aol, etc), and associates the credentials obtained with one user account.",
	  contact: "jeremy.jannotta@teamaol.com",
	  license: "BSD",
	  licenseUrl: "https://github.com/aol/node-multipass/blob/master/LICENSE-BSD"
	});

	// Configure paths to json api, and baseUrl to actual api
  swagger.configureSwaggerPaths('', 'api-docs', '');
  swagger.configure(config.getBaseUrl(), require('../package.json').version);
  
	// Serve up swagger ui at /docs via static route
	app.get(/^\/docs(\/.*)?$/, function(req, res, next) {
	  // express static barfs on root url w/o trailing slash
	  if (req.url === '/docs') { 
	    res.writeHead(302, { 'Location' : req.url + '/' });
	    res.end();
	    return;
	  }
	  
	  // Use own template for root page
	  if (req.url === '/docs/') {
	  	res.render(__dirname + '/swagger');
	  	
	 	// else pull other assets from node module
	  } else {
			var docs_handler = express.static(__dirname + '/../node_modules/swagger-ui/dist/');
			
		  // take off leading /docs so that connect locates file correctly
		  req.url = req.url.substr('/docs'.length);
		  return docs_handler(req, res, next);
		}
	});
  
};

module.exports.init = init;
module.exports.addResources = addResources;
module.exports.addModels = swagger.addModels;
