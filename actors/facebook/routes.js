var config = require('../../conf/config')
  , auth = require('../../auth')
  , HttpHelper = require('../../routes/httphelper')
  , ApiResponse = require('../../data/apiresponse')
  , util = require('util')
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
  
  /**
   * Add a Facbook page of current providerId as a new auth provider.
   * 
   * POST body:
   * [
   *   {
   * 	   id: 123123123,
   *     displayName: "Jeremy's re-named facebook page",
   *   },
   *   {
   *     id: 89348734
   *   }
   * ]
   * 
   */
  app.post(config.paths.api + '/user/facebook/:providerId/pages',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res),
      	pages = [];
      	
      if (req.body) {
      	if (util.isArray(req.body) && req.body.length) {
      		pages = req.body;
      	} else {
      		pages = [req.body];
      	}
      }
      
      facebookActor.addPageProfiles(req.user, req.params.providerId, pages, function(data) {
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
