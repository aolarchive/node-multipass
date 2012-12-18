var passport = require('passport')
  , _ = require('underscore')._
  , config = require('../conf/config')
  , userAPI = require('../data/user')
  , HttpHelper = require('../routes/httphelper')
  , ApiResponse = require('../data/apiresponse')
  , appAuth = require('./app');


// Passport session setup.
// To support persistent login sessions, serialize the user by storing the 
// userId in an object.
passport.serializeUser(function(user, done) {
  var serializedData = {
      userId: null
  }
  if (user instanceof ApiResponse) {
    if (user.isError()) {
      done(user.getData(), serializedData);
    } else {
      serializedData.userId = user.data.userId;
      done(null, serializedData);
    }
  } else {
    serializedData.userId = user.userId;
    done(null, serializedData);
  }
});

// Return user object persisted in the session.
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


var auth = {
    
  providers: [],
  
  _appAuthHandler: null,
  
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  init: function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    appAuth(auth);
    this.loadProviders(app);
  },
  
  setRedirect: function(req) {
      //req.session.authredirect = config.paths.authRedirect;
      if (req.param('r') != null) {
          req.session.authredirect = req.param('r');
      }
  },
  
  authenticate: function(provider, options) {
   options = options || {};
   options.successRedirect = options.successRedirect || config.paths.authRedirect || '/';
   options.failureRedirect = options.failureRedirect || config.paths.failRedirect || '/';
  
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
           passport.authorize(provider, { scope: options.scope })(req, res, next);
       }
   }
  },
  
  associate: function() {
    return function(req, res, next) {

      var user = req.user,
        profile = req.account;

      // Auth'ed already, associating profile with current user
      if (user != null && profile != null) {
        userAPI.getUser(user.userId, function(apiRes) {
          
          if (apiRes.isError()) {
            req.apiResponse = apiRes; // Return error
            next();  
          } else {
            
            var data = apiRes.data,
              matchingProfile = userAPI.findProfileByUser(data, profile.provider, profile.id);
            
            // If no matching profile exists, create one
            if (!matchingProfile) {
                userAPI.addProfile(data, profile, profile.authToken,
                  function(profileRes){
                    req.apiResponse = profileRes; // Return 201 + profile object, or error
                    next();
                  }
                );
            // Else profile already exists
            } else {
              req.apiResponse = new ApiResponse(200, matchingProfile);  // Return 200 + profile object
              next();
            }
          }
        });
      
      // Auth for first time, just uses existing user data
      } else {
        req.apiResponse = new ApiResponse(200); // Return 200 + no data
        next(); 
      }

    }
  },
  
  /**
   * Middleware to verify passport.authenticate when unauthed; loads user from records 
   */
  authVerify: function(provider, accessToken, refreshToken, profile, done){
    profile.authToken = accessToken;
    
    userAPI.findOrAddUser(profile, accessToken, function(obj){
      return done(null, obj);
    });
  },

  /**
   * Middleware to verify passport.authorize when already authed; for now just passes on profile
   */
  authzVerify: function(provider, accessToken, refreshToken, profile, done){
    profile.authToken = accessToken;
    
    return done(null, profile);
  },

  /** 
   * Generic utility to initialize and use different auth Strategies, called by
   * each Strategy implementation.
   */
  useStrategy: function(provider, strategy, options, verify) {
    passport.use(
      provider.strategy,
      new strategy(options, verify)
    );
  },

  /**
   * Wrapper for useStrategy() for OAuth Strategy implementations.
   */
  useOAuthStrategy: function(provider, strategy, options, verify) {
    options = _.extend({
      callbackURL: config.getBaseUrl() + auth.getProviderCallbackUrl(provider.strategy),
      passReqToCallback: true
    }, options);
    
    verify = verify || function(req, accessToken, refreshToken, profile, done) {
      // Invalid signature
      if (arguments.length != 5 || !req || typeof(req) != 'object') {
        return done(Error('Invalid signature in verify strategy.'), false);
      
      // Not logged in. Load user.
      } else if (!req.user) {
        return auth.authVerify(provider, accessToken, refreshToken, profile, done);
    
      // Logged in. Associate account with user.
      } else {
        return auth.authzVerify(provider, accessToken, refreshToken, profile, done);
      }
    }
    
    auth.useStrategy(provider, strategy, options, verify);
  },

  /**
   * Wrapper for useStrategy() for OpenID Strategy implementations.
   */
  useOpenIDStrategy: function(provider, strategy, options, verify) {
    options = _.extend({
      returnURL: config.getBaseUrl() + auth.getProviderCallbackUrl(provider.strategy),
      passReqToCallback: true
    }, options);
    
    verify = verify || function(req, identifier, profile, done) {
      // Invalid signature
      if (arguments.length != 4 || !req || typeof(req) != 'object') {
        return done(Error('Invalid signature in verify strategy.'), false);
      
      // Not logged in. Load user.
      } else if (!req.user) {
        return auth.authVerify(provider, identifier, null, profile, done);
    
      // Logged in. Associate account with user.
      } else {
        return auth.authzVerify(provider, identifier, null, profile, done);
      }
    }
    
    auth.useStrategy(provider, strategy, options, verify);
  },

  handleResponse: function() {
    return function(req, res, next) {
      var http = new HttpHelper(req, res),
        apiRes = req.apiResponse || new ApiResponse();
      
      if (req.session.authredirect) {
        res.redirect(req.session.authredirect);
      } else {
        http.send(apiRes);
      }
    }
  },
  
  //Simple route middleware to ensure user is authenticated.
  //Use this route middleware on any resource that needs to be protected.  If
  //the request is authenticated (typically via a persistent login session),
  //the request will proceed.  Otherwise, a 401 status will be returned
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    //res.redirect(config.paths.failRedirect);
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
            [auth.authenticate(provider.strategy, { scope: provider.scope, failureRedirect: config.paths.failRedirect }),
             auth.associate(),
             auth.handleResponse()]
          );
        }
      });
    }
  },

  appAuthHandler: function(req, res, next){
    
    // Use custom app auth handler if defined
    if (auth._appAuthHandler) {
      
      auth._appAuthHandler(req, res, function(err, data) {
        var http = new HttpHelper(req, res),
          errRes = new ApiResponse(401, Error('Invalid appId.')),
          appId = null;
        
        if (err || !data) {
          // Unauthorized
          http.send(errRes);
        } else {
          // Auth successful, so do something with credentials
          appId = typeof data == 'string' ? data : data.appId;
          if (!appId) {
            http.send(errRes);
          } else {
            console.log('Authorized: ...' + appId.substr(-6));
            req.appUser = { 'appId': appId };
            next();
          }
        }
      });
      
    // Else continue without authenticating app
    } else {
      next(); 
    }
  },
  
  setAppAuthHandler: function(func) {
    this._appAuthHandler = func;
  }
  
};

module.exports = auth;