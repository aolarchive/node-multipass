var passport = require('passport')
  , config = require('../conf/config')
  , userAPI = require('../data/user');


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
    
  providers: [],

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  init: function(app) {
    app.use(passport.initialize());
    app.use(passport.session());
    
    this.loadProviders(app);
  },
  
  setRedirect: function(req) {
      req.session.authredirect = config.paths.authRedirect;
      if (req.param('r') != null) {
          req.session.authredirect = req.param('r');
      }
  },
  
  authenticate: function(provider, options) {
   options = options || {};
   options.successRedirect = options.successRedirect || config.paths.authRedirect || '/';
   options.failureRedirect = options.failureRedirect || config.paths.login || '/login';
  
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
          var profiles = user.profiles;
          var bExists=false;
          //debugger;
          for (var i=0; i < profiles.length; i++) {
              if (profiles[i].provider == profile.provider && profiles[i].providerId == profile.id) {
                  bExists=true;
                  break;
              }
          }
          //debugger;
          if (!bExists) {
              userAPI.addProfile(user, profile, profile.authToken,
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
  },
  
  //Simple route middleware to ensure user is authenticated.
  //Use this route middleware on any resource that needs to be protected.  If
  //the request is authenticated (typically via a persistent login session),
  //the request will proceed.  Otherwise, a 401 status will be returned
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    //res.redirect(config.paths.login);
    res.send(401);
  },
  
  getProviderLoginUrl: function(strategy) {
    return config.paths.api + '/auth/' + String(strategy).toLowerCase();
  },

  getProviderCallbackUrl: function(strategy) {
    return this.getProviderLoginUrl(strategy) + '/callback';
  },
  
  getAuthzStrategy: function(strategy) {
      return strategy + '-authz';
  },
  
  addProvider: function(provider) {
    var providerData = {
        'provider': provider.strategy,
        'loginUrl': this.getProviderLoginUrl(provider.strategy)
    };
    this.providers.push(providerData);
  },
  
  loadProviders: function(app) {
    var auth = this;
    
    if (config && config.providers) {
      Object.keys(config.providers).forEach(function(key) {
        var provider = require('./providers/' + String(key).toLowerCase()).provider;
        if (provider) {
          
          // Add provider to list of available providers
          auth.addProvider(provider);
          
          // Assign login and callback routes for provider
          
          app.get(auth.getProviderLoginUrl(provider.strategy),
            function(req, res, next) {
              auth.setRedirect(req);
              next();
            },
            auth.authenticate(provider.strategy, { scope: provider.scope })
          );
    
          app.get(auth.getProviderCallbackUrl(provider.strategy),
            [auth.authenticate(provider.strategy, { scope: provider.scope, failureRedirect: config.paths.login }),
             auth.associate()]
          );
        }
      });
    }
  }
  
};

module.exports = auth;