var passport = require('passport')
  , auth = require('../auth')
  , userProfile = require('../data/user');


//Simple route middleware to ensure user is authenticated.
//Use this route middleware on any resource that needs to be protected.  If
//the request is authenticated (typically via a persistent login session),
//the request will proceed.  Otherwise, the user will be redirected to the
//login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

module.exports = function(app){
  
  app.get('/', function(req, res){
    res.render('index', { user: req.user });
  });
  
  app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
  });
  
  app.get('/login', function(req, res){
    res.render('login', { user: req.user });
  });
  
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  
  app.get('/provider/:provider/:providerId', 
    //ensureAuthenticated, 
    function(req, res, next) {
      var profile = {
          provider: req.params.provider,
          id: req.params.providerId
      };
      userProfile.findProfile(profile, function(doc){
        res.json(doc);
      });
    }
  );
  
  // GET /auth/facebook
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Facebook authentication will involve
  //   redirecting the user to facebook.com.  After authorization, Facebook will
  //   redirect the user back to this application at /auth/facebook/callback
  app.get('/auth/facebook',
    function(req, res, next) {
        auth.setRedirect(req);
        next();
    },
    auth.authenticate('facebook')
  );
  
  // GET /auth/facebook/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/facebook/callback',
    [auth.authenticate('facebook', { failureRedirect: '/login' }),
    auth.associate()]
  );
  
  
  //GET /auth/twitter
  //Use passport.authenticate() as route middleware to authenticate the
  //request.  The first step in Twitter authentication will involve redirecting
  //the user to twitter.com.  After authorization, the Twitter will redirect
  //the user back to this application at /auth/twitter/callback
  app.get('/auth/twitter',
    function(req, res, next) {
      auth.setRedirect(req);
      next();
    },
    auth.authenticate('twitter')
  );
  
  //GET /auth/twitter/callback
  //Use passport.authenticate() as route middleware to authenticate the
  //request.  If authentication fails, the user will be redirected back to the
  //login page.  Otherwise, the primary route function function will be called,
  //which, in this example, will redirect the user to the home page.
  app.get('/auth/twitter/callback', 
      [auth.authenticate('twitter', { failureRedirect: '/login' }),
       auth.associate()]
  );
  
};