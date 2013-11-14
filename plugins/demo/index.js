var els = require('../../auth/els');
 
module.exports = {
  
  name: 'demo',
  
  static: 'public/',
  
  staticRoute: '/demo/',
  
  init: function(app, options) {
  	options = options || {};
  	var encodedAuth = '';
  	
  	if (options.appId && options.appSecret) {
  		encodedAuth = new Buffer(options.appId + ':' + options.appSecret).toString('base64');
  	}
  	
  	// Protect entire folder behind ELS authentication
  	app.all('/demo/?*',
			els.ensureAuthenticated
  	);
  	
  	// Proxy all /demo/api/ requests, and inject auth creds
    app.all('/demo/api/*',
	    function(req, res, next) {
	    	
    		req.url = req.url.replace('/demo/api/', '/api/');
    		
    		if (encodedAuth) {
    			req.headers['authorization'] = 'Basic ' + encodedAuth;
    		}	
    	
	      next('route');
	    }
	  );
		
  }
  
};
