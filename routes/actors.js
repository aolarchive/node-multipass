var passport = require('passport')
  , config = require('../conf/config')
  , auth = require('../auth')
  , appAPI = require('../data/app')
  , HttpHelper = require('./httphelper')
  , ApiResponse = require('../data/apiresponse')
  , twitterActor = require('../actors/twitter')
  , tumblrActor = require('../actors/tumblr');


module.exports = function(app){
  
  /*
   * Twitter actor API
   */
  
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

  /*
   * Tumblr actor API
   */
  
  app.get(config.paths.api + '/actors/tumblr/:providerId/user/blogs',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      tumblrActor.getBlogs(req.user, req.params.providerId, function(data) {
        http.send(data);
      });
    }
  );
  
  app.post(config.paths.api + '/actors/tumblr/:providerId/user/blogs/:hostname/post',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res),
        title = req.body && req.body.title,
        body = req.body && req.body.body;
      
      tumblrActor.postToBlog(req.user, req.params.providerId, req.params.hostname, title, body, function(data) {
        http.send(data);
      });
    }
  );
  
};