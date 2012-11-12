var passport = require('passport')
  , config = require('../conf/config')
  , auth = require('../auth')
  , userAPI = require('../data/user');


module.exports = function(app){
  
  app.get('/', function(req, res){
    res.render('index', { user: req.user, providers: auth.providers });
  });
  /*
  app.get(config.paths.login, function(req, res){
    res.render('login', { user: req.user });
  });
  */
  app.get(config.paths.logout, function(req, res){
    req.logout();
    res.redirect('/');
  });
  
  app.get(config.paths.api + '/user',
    auth.ensureAuthenticated, 
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
  
  app.delete(config.paths.api + '/user',
    auth.ensureAuthenticated, 
    function(req, res){
      userAPI.removeUser(req.user.userId,
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
    auth.ensureAuthenticated, 
    function(req, res, next) {
      userAPI.getProfile(req.user, req.params.provider, req.params.providerId, function(doc){
        res.json(doc);
      });
    }
  );
  
  app.delete(config.paths.api + '/user/:provider/:providerId', 
    auth.ensureAuthenticated, 
    function(req, res, next) {
      userAPI.removeProfile(req.user, req.params.provider, req.params.providerId, function(doc){
        res.json(doc);
      });
    }
  );
  
  app.get(config.paths.api + '/auth/providers', 
    //auth.ensureAuthenticated, 
    function(req, res, next) {
      res.json(auth.providers);
    }
  );
  
};