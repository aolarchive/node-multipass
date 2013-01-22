var passport = require('passport')
  , _ = require('underscore')._
  , config = require('../conf/config')
  , userAPI = require('../data/user')
  , HttpHelper = require('../routes/httphelper')
  , ApiResponse = require('../data/apiresponse');
  //, appAuth = require('./app');


// Passport session setup.
// To support persistent login sessions, serialize the user by storing the 
// userId in an object.
passport.serializeUser(function(user, done) {
  console.log('passport.serializeUser');
  
  var serializedData = {
      appId: null,
      userId: null
  }
  if (user instanceof ApiResponse) {
    if (user.isError()) {
      done(user.getData(), serializedData);
    } else {
      serializedData.appId = user.data.appId;
      serializedData.userId = user.data.userId;
      done(null, serializedData);
    }
  } else {
    serializedData.appId = user.appId;
    serializedData.userId = user.userId;
    done(null, serializedData);
  }
});

// Return user object persisted in the session.
passport.deserializeUser(function(obj, done) {
  console.log('passport.deserializeUser');
  done(null, obj);
});


var auth = {
    
  providers: [],
  
  _appAuthHandler: null,
  
  _appAuthStrategy: null,
  
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  init: function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    //appAuth(auth);
    this.loadAppProvider('app');
    this.loadProviders(app);
  },
  
  setRedirect: function(req) {
      //req.session.authredirect = config.paths.authRedirect;
      if (req.param('r') != null && req.session) {
          req.session.authredirect = req.param('r');
      }
  },
  
  authenticateProvider: function(provider, options) {
   options = options || {};
   options.successRedirect = options.successRedirect || config.paths.authRedirect || '/';
   options.failureRedirect = options.failureRedirect || config.paths.failRedirect || '/';
  
   return function(req, res, next) {
     console.log('auth.authenticateProvider');
       //if (!req.isAuthenticated()) {
           // not authenticated, this is an initial sign on.  If its the first time we've seen this particular
           // third-party account, a local "user" record will be created for associating with it
       //    passport.authenticate(provider, { session:true, scope: options.scope })(req, res, next);
       //} else {
           // already authenticated.  this user is "connecting" another third party account
           // using authorize causes passport to put it on req.account, and not touch the existing
           // user and session  - see here: http://passportjs.org/guide/authorize.html
           // we'll next out into `associate` middleware for app-specific logic
           passport.authorize(provider, { session:false, scope: options.scope })(req, res, next);
       //}
   }
  },
  
  associate: function() {
    return function(req, res, next) {
      console.log('auth.associate');
      var user = req.user,
        profile = req.account;
//debugger;
      // Auth'ed already, associating profile with current user
      if (user != null && profile != null) {
        userAPI.getUser(user, true, function(apiRes) {
          
          if (apiRes.isError()) {
            req.apiResponse = apiRes; // Return error
            next();
            
          } else {
            var data = apiRes.data, matchingProfile;
            
            // User exists
            if (data) {
              matchingProfile = userAPI.findProfileByUser(data, profile.provider, profile.id);
              
              // If no matching profile exists, add profile
              if (!matchingProfile) {
                userAPI.addProfile(user, profile,
                  function(profileRes){
                    req.apiResponse = profileRes; // Return 201 + profile object, or error
                    next();
                  }
                );
              // Else profile already exists, update profile
              } else {
                userAPI.updateProfileByUser(data, profile, 
                  function(updateRes){
                    req.apiResponse = updateRes;
                    next();
                  }
                );
              }
              
            // No user exists, so create it
            } else {
              userAPI.addUser(user, profile, function(addRes){
                req.apiResponse = addRes;
                next();
              });
            }
          }
        });
      
      // Missing user or profile data, 
      } else {
        req.apiResponse = new ApiResponse(500, new Error('Profile not associated. D\'oh! Shouldn\'t have gotten to the point.'));
        next(); 
      }

    }
  },
  
  /**
   * Middleware to verify passport.authenticate when unauthed; loads user from records 
   */
  authVerify: function(req, provider, accessToken, refreshToken, profile, done){
    console.log('auth.authVerify');
    profile.authToken = accessToken;
    profile.authTokenSecret = refreshToken;
    var context = req.user || {};
    
    userAPI.findOrAddUser(context, profile, function(obj){
      return done(null, obj);
    });
  },

  /**
   * Middleware to verify passport.authorize when already authed; for now just passes on profile
   */
  authzVerify: function(req, provider, accessToken, refreshToken, profile, done){
    console.log('auth.authzVerify');
    profile.authToken = accessToken;
    profile.authTokenSecret = refreshToken;
    
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
      //} else if (!req.user) {
      //  return auth.authVerify(req, provider, accessToken, refreshToken, profile, done);
    
      // Logged in. Associate account with user.
      } else {
        return auth.authzVerify(req, provider, accessToken, refreshToken, profile, done);
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
      //} else if (!req.user) {
      //  return auth.authVerify(req, provider, identifier, null, profile, done);
    
      // Logged in. Associate account with user.
      } else {
        return auth.authzVerify(req, provider, identifier, null, profile, done);
      }
    }
    
    auth.useStrategy(provider, strategy, options, verify);
  },

  handleResponse: function() {
    return function(req, res, next) {
      console.log('auth.handleResponse');
      var http = new HttpHelper(req, res),
        apiRes = req.apiResponse || new ApiResponse();
      
      if (req.session && req.session.authredirect) {
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
            auth.authenticateApp({ session:false, forceAuth:false }),
            function(req, res, next) {
              auth.setRedirect(req);
              next();
            },
            auth.authenticateProvider(provider.strategy, { scope: provider.scope })
          );
    
          app.get(auth.getProviderCallbackUrl(provider.strategy),
            [auth.authenticateApp({ forceAuth:false }),
             auth.authenticateProvider(provider.strategy, { scope: provider.scope, failureRedirect: config.paths.failRedirect }),
             auth.associate(),
             auth.handleResponse()]
          );
        }
      });
    }
  },
/*
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
            req.user = req.user || {};
            req.user['appId'] = appId;
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
  },
  */
  
  authenticateApp: function(options){
    options = _.extend({
      session: true,    // Store auth credentials in session
      forceAuth: true   // Force re-authentication, even if auth credentials exist in session
    }, options);
    
    return function(req, res, next){
      console.log('authenticateApp', req.user);
      if (!req.isAuthenticated() || options.forceAuth) {
        console.log('authenticateApp: forceAuth');
        passport.authenticate(auth._appAuthStrategy, options)(req, res, next);
      } else {
        console.log('authenticateApp: pass');
        next();
      }
    }
  },
  
  loadAppProvider: function(strategy) {
    this._appAuthStrategy = strategy;
    
    var provider = require('./providers/' + String(strategy).toLowerCase()).provider;
    if (provider) console.log('Using app auth provider "'+strategy+'"');
    else console.log('Error loading app auth provider "'+strategy+'"');
  },
  /*
  loadUser: function(req, res, next) {
    var http = new HttpHelper(req, res),
      userId = null;
      
    if (req.user) {
      userId = req.params.userId || req.get('x-multipass-user') || null;
      if (userId) {
        req.user.userId = userId;
        next();
      } else {
        http.send( new ApiResponse(400, Error('Invalid userId')) );
      }
      
    } else {
      // Error, not authorized
      http.send( new ApiResponse(401, Error('Not authorized')) );
    }
  }*/
  
};

module.exports = auth;