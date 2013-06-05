var config = require('../../conf/config')
  , auth = require('../../auth')
  , HttpHelper = require('../../routes/httphelper')
  , ApiResponse = require('../../data/apiresponse')
  , twitterActor = require('./twitter');


module.exports = function(app){
	
  app.get(config.paths.api + '/actors/twitter/:providerId/timeline',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res),
        status = req.body && req.body.status;
      
      twitterActor.getTimeline(req.user, req.params.providerId, function(data) {
        http.send(data);
      });
    }
  );
  
  app.post(config.paths.api + '/actors/twitter/:providerId/status',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res),
        status = req.body && req.body.status;
      
      twitterActor.updateStatus(req.user, req.params.providerId, status, function(data) {
        http.send(data);
      });
    }
  );
  
};
