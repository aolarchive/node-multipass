var passport = require('passport')
  , config = require('../conf/config')
  , auth = require('../auth')
  , userAPI = require('../data/user')
  , HttpHelper = require('./httphelper')
  , ApiResponse = require('../data/apiresponse');


module.exports = function(app){

  /**
   * [*] /*
   * 
   * Process all requests for initial validation or normalization tasks:
   * * Detect if SSL; return error is sslRequired and not https
   */
  app.all('/*', 
    HttpHelper.sslHandler
  );
  
  app.configure('development', 'heroku', function(){
    
    /**
     * GET /
     * 
     * Shows simple dashboard page that shows user data, and has UI to 
     * remove items, login/logout.
     */
    app.get('/', function(req, res){
      
      var renderPage = function(user) {
        res.render('index', { user: user, providers: auth.providers, config: config });
      };
      
      if (!req.isAuthenticated()) {
        renderPage(req.user);
      } else {
        userAPI.getUser(req.user.userId, function(data) {
          renderPage(data.data);
        });
      }
      
    });
    
  });

  /**
   * GET /api/logout
   * 
   * Logout the current user session.
   */
  app.get(config.paths.api + config.paths.logout, function(req, res){
    req.logout();
    var http = new HttpHelper(req, res);
    http.send();
  });
  
  /**
   * GET /api/user
   * 
   * Gets the complete user object for current user, including all associated profiles.
   */
  app.get(config.paths.api + '/user',
    auth.ensureAuthenticated, 
    function(req, res) {
      var http = new HttpHelper(req, res);
      
      userAPI.getUser(req.user.userId, function(data) {
        http.send(data);
      });
    }
  );
  
  /**
   * DELETE /api/user
   * 
   * Remove all user data for current user, and logs out the current session.
   */
  app.delete(config.paths.api + '/user',
    auth.ensureAuthenticated, 
    function(req, res) {
      var http = new HttpHelper(req, res);
      
      userAPI.removeUser(req.user.userId, function(data) {
        req.logout(); // Must logout so session data for this user doesn't persist
        http.send(data);
      });
    }
  );

  /**
   * GET /api/user/:userId
   * 
   * Gets the complete user object for the given userId, including all associated profiles.
   */
  app.get(config.paths.api + '/user/:userId',
    auth.ensureAuthenticated, 
    function(req, res) {
      var http = new HttpHelper(req, res);
      
      userAPI.getUser(req.params.userId, function(data) {
        http.send(data);
      });
    }
  );

  /**
   * GET /api/user/:provider/:providerId
   * 
   * Get an auth profile for current user, by given provider name and id.
   */
  app.get(config.paths.api + '/user/:provider/:providerId', 
    auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      
      userAPI.getProfile(req.user, req.params.provider, req.params.providerId, function(data){
        http.send(data);
      });
    }
  );
  
  /**
   * DELETE /api/user/:provider/:providerId
   * 
   * Remove an auth profile for current user, by given provider name and id.
   */
  app.delete(config.paths.api + '/user/:provider/:providerId', 
    auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
    
      userAPI.removeProfile(req.user, req.params.provider, req.params.providerId, function(data){
        http.send(data);
      });
    }
  );
  
  /**
   * GET /api/auth/providers
   * 
   * Get list of available auth providers, and their login URLs.
   */
  app.get(config.paths.api + '/auth/providers', 
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      var http = new HttpHelper(req, res);
      var data = new ApiResponse(auth.providers || []);
      http.send(data);
    }
  );
  
  /**
   * [*] /api/*
   * 
   * Catch all other requests and return 400 error. 
   */
  app.all(config.paths.api + '/*', function(req, res) {
    var http = new HttpHelper(req, res);
    var err = new ApiResponse(400, Error('Invalid request'));
    http.send(err);
  });
  
  /**
   * Amend express.param() to accept second param as regexp.
   * Skips to next route if regexp not matched.
   */
  app.param(function(name, fn){
    if (fn instanceof RegExp) {
      return function(req, res, next, val){
        var captures;
        if (captures = fn.exec(String(val))) {
          req.params[name] = captures;
          next();
        } else {
          next('route');
        }
      }
    }
  });
  
  /**
   * Validate :provider param
   */
  app.param('provider', /^[\w-]+$/i);
  
  /**
   * Validate :providerId param
   */
  app.param('providerId', /^[\w-]+$/i);
  
  /**
   * Validate :userId param
   */
  app.param('userId', /^[\w-]+$/i);
};