var passport = require('passport')
  , config = require('../conf/config')
  , providers = require('./providers')
  , userProfile = require('../data/user');


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


var auth = {

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  init: function(app) {
    app.use(passport.initialize());
    app.use(passport.session());
  },
  
  setRedirect: function(req) {
      req.session.authredirect = '/';
      if (req.param('r') != null) {
          req.session.authredirect = req.param('r');
      }
  },
  
  authenticate: function(provider, options) {
   options = options || {};
   options.successRedirect = options.successRedirect || '/';
   options.failureRedirect = options.failureRedirect || '/login';
  
   return function(req, res, next) {
       if (!req.isAuthenticated()) {
           // not authenticated, this is an initial sign on.  If its the first time we've seen this particular
           // third-party account, a local "user" record will be created for associating with it
           passport.authenticate(provider, { scope: options.scope})(req, res, next);
       } else {
           // already authenticated.  this user is "connecting" another third party account
           // using authorize causes passport to put it on req.account, and not touch the existing
           // user and session  - see here: http://passportjs.org/guide/authorize.html
           // we'll next out into `associate` middleware for app-specific logic
           passport.authorize(provider + '-authz', { scope: options.scope })(req, res, next);
       }
   }
  },
  
  associate: function() {
    return function(req, res, next) {
       var user = req.user;
       var profile = req.account;
  
       if (user != null && profile != null) {
           var bExists=false;
           if (user.provider == profile.provider) {
               bExists=true;
           }
           if (!bExists) {
               userProfile.addProfile(profile, profile.authToken,
                   function(u){
                       res.redirect(req.session.authredirect);
                   }
               );
           } else {
               res.redirect(req.session.authredirect);
           }
       } else {
           res.redirect(req.session.authredirect);
       }
  
    }
  }
  
};

module.exports = auth;