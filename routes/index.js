var passport = require('passport')
  , config = require('../conf/config')
  , auth = require('../auth')
  , userAPI = require('../data/user')
  , HttpHelper = require('./httphelper')
  , ApiResponse = require('../data/apiresponse');


module.exports = function(app){
  
  app.configure('development', function(){
    
    app.get('/', function(req, res){
      if (!req.isAuthenticated()) {
        res.render('index', { user: req.user, providers: auth.providers });
      } else {
        userAPI.getUser(req.user.userId, function(data) {
          res.render('index', { user: data.data, providers: auth.providers });
        });
      }
    });
    
  });

  app.get(config.paths.api + config.paths.logout, function(req, res){
    req.logout();
    var http = new HttpHelper(req, res);
    http.send();
  });
  
  app.get(config.paths.api + '/user',
    auth.ensureAuthenticated, 
    function(req, res) {
      var http = new HttpHelper(req, res);
      
      userAPI.getUser(req.user.userId, function(data) {
        http.send(data);
      });
    }
  );
  
  app.delete(config.paths.api + '/user',
    auth.ensureAuthenticated, 
    function(req, res) {
      var http = new HttpHelper(req, res);
      
      userAPI.removeUser(req.user.userId, function(data) {
        http.send(data);
        req.logout(); // Must logout so session data for this user doesn't persist
      });
    }
  );

  app.get(config.paths.api + '/user/:provider/:providerId', 
    auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      userAPI.getProfile(req.user, req.params.provider, req.params.providerId, function(data){
        http.send(data);
      });
    }
  );
  
  app.delete(config.paths.api + '/user/:provider/:providerId', 
    auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
    
      userAPI.removeProfile(req.user, req.params.provider, req.params.providerId, function(data){
        http.send(data);
      });
    }
  );
  
  app.get(config.paths.api + '/auth/providers', 
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      var data = new ApiResponse(null, auth.providers || []);
      http.send(data);
    }
  );
  
  app.all(config.paths.api + '/*', function(req, res) {
    var http = new HttpHelper(req, res);
    var err = new ApiResponse({}, null, 400, 'Invalid request');   
    http.send(err);
  });
};