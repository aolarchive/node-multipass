var config = require('../../conf/config')
  , auth = require('../../auth')
  , HttpHelper = require('../../routes/httphelper')
  , ApiResponse = require('../../data/apiresponse')
  , tumblrActor = require('./tumblr');


module.exports = function(app){
	
  app.get(config.paths.api + '/actors/tumblr/:providerId/user/blogs',
    auth.authenticateApp(),
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      tumblrActor.getBlogs(req.user, req.params.providerId, function(data) {
        http.send(data);
      });
    }
  );
  
  app.post(config.paths.api + '/actors/tumblr/:providerId/blog/:hostname/post',
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
