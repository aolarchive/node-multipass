 
module.exports = {
  
  name: 'demo',
  
  static: 'public/',
  
  staticRoute: '/demo',
  
  auth: '',
  appId: '',
  appSecret: '',
  
  init: function(app) {
  	if (this.appId && this.appSecret) {
  		this.auth = new Buffer(this.appId + ':' + this.appSecret).toString('base64');
  	}
  	
  	// Proxy all /demo/api/ requests, and inject auth creds
    app.all('/demo/api/*',
	    function(req, res, next) {
	    	
    		req.url = req.url.replace('/demo/api/', '/api/');
    		
    		if (module.exports.auth) {
    			req.headers['authorization'] = 'Basic ' + module.exports.auth;
    		}	
    	
	      next('route');
	    }
	  );
		
  }
  
};
