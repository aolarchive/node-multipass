var config = require('../../conf/config')
  , auth = require('../../auth')
  , HttpHelper = require('../../routes/httphelper')
  , ApiResponse = require('../../data/apiresponse')
  , facebookActor = require('./facebook');


module.exports = function(app){
	
	app.get(config.paths.api + '/actors/facebook/:providerId/profile',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      facebookActor.getProfile(req.user, req.params.providerId, function(data) {
        http.send(data);
      });
    }
  );
  
	app.get(config.paths.api + '/actors/facebook/:providerId/pages',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      facebookActor.getPages(req.user, req.params.providerId, function(data) {
        http.send(data);
      });
    }
  );
  
  app.post(config.paths.api + '/actors/facebook/:providerId/feed',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res),
      	message = req.body && req.body.message;
      
      facebookActor.postToFeed(req.user, req.params.providerId, message, function(data) {
        http.send(data);
      });
    }
  );
  
};
