var passport = require('passport')
  , config = require('../conf/config')
  , auth = require('../auth')
  , userAPI = require('../data/user');


//Simple route middleware to ensure user is authenticated.
//Use this route middleware on any resource that needs to be protected.  If
//the request is authenticated (typically via a persistent login session),
//the request will proceed.  Otherwise, the user will be redirected to the
//login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect(config.paths.login);
}

module.exports = function(app){
  
  app.get('/', function(req, res){
    res.render('index', { user: req.user });
  });
  
  app.get(config.paths.api + '/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
  });
  
  app.get(config.paths.login, function(req, res){
    res.render('login', { user: req.user });
  });
  
  app.get(config.paths.logout, function(req, res){
    req.logout();
    res.redirect('/');
  });
  
  app.get(config.paths.api + '/user',
      ensureAuthenticated, 
      function(req, res){
        userAPI.getUser(req.user.userId,
          function(userDoc){
              if (userDoc != null){
                res.json(userDoc);
              } else {
                res.json({});
              }
          }
        );
      }
  );

  app.get(config.paths.api + '/user/:provider/:providerId', 
    ensureAuthenticated, 
    function(req, res, next) {
      userAPI.getProfile(req.user, req.params.provider, req.params.providerId, function(doc){
        res.json(doc);
      });
    }
  );
  
  app.get(config.paths.api + '/provider', 
    //ensureAuthenticated, 
    function(req, res, next) {
      res.json(auth.providers);
    }
  );
  
};