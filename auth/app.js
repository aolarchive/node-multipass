var config = require('../conf/config')
  , HttpHelper = require('../routes/httphelper')
  , ApiResponse = require('../data/apiresponse')
  , appAPI = require('../data/app');


module.exports = function(auth) {
  
  auth.setAppAuthHandler(function(req, res, done){
    //console.log('auth.setAppAuthHandler');
    //console.log(req.auth);
    
    var host = req.get('host');
    
    if (req.auth) {
      // Validate auth credentials
      appAPI.authenticateApp(req.auth.username, req.auth.password, host, function(apiRes) {
        if (apiRes.isError()) {
          // Return error
          done(apiRes.getData());
        } else if (!apiRes.getData()) {
          // Credentials did not match, so not authorized
          done(null, false);
        } else {
          // Match found, authorized, return app data
          done(null, apiRes.getData());
        }
      });
    } else {
      // No auth credentials provided, so not authorized
      done(null, false);
    }
  });
  
};
