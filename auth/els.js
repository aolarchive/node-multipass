var ELSStrategy = require('passport-els').Strategy;


/**
 * Define ELS verification in strategy
 */
var strategy = new ELSStrategy( function(req, done) {
  this.ELS(req, function(err,user) {
    if(err) return done(err, null);
    done(null, user);
  }); 
});

module.exports = {
	/**
	 * Ensure authentication
	 */
	ensureAuthenticated : function(req, res, next) {
	  strategy.authenticate(req, null, function(err,user) {
	    if(err) return res.send(403, err);
	    if(user) { 
	      req.user = user;         // add user to request object
	      next(); 
	    }
	  });
	}
	
};
