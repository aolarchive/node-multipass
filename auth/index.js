var passport = require('passport')
  , _ = require('underscore')._
  , querystring = require('querystring')
  , crypto = require('crypto')
  , urlUtil = require('url')
  , config = require('../conf/config')
  , userAPI = require('../data/user')
  , HttpHelper = require('../routes/httphelper')
  , ApiResponse = require('../data/apiresponse')
  , debug = require('debug')('multipass:auth');


// Passport session setup.
// To support persistent login sessions, serialize the user by storing the 
// userId in an object.
passport.serializeUser(function(user, done) {
  var serializedData = {
      appId: null,
      userId: null
  };
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
  done(null, obj);
});


var auth = {
    
  providers: [],
  
  _appAuthStrategy: null,
  
  _sessionTimeout: (1000 * 60 * 5),	// 5 min
  
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  init: function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    this.loadAppProvider('app');
    this.loadProviders(app);
  },
  
  /**
   * Generate validate rules object, for HttpHelper.validate middleware.
   * 
   * @param {Object} req The current request object
   * @returns {Object} Rules object to use  
   */
  validateRules: function (req) {
    return [
      {
        name: 'scope',
        value: req.query.scope,
        pattern: /^[\w.,-]+$/i
      },
      {
        name: 'r',
        value: req.query.r,
        pattern: /^.+$/i
      },
      {
        name: 'state',
        value: req.query.state,
        pattern: /^.+$/i
      },
      {
        name: 'force_login',
        value: req.query.force_login,
        pattern: /^[\w]+$/i
      },
    ];
  },
  
  prepareSession: function(provider) {
  	return function(req, res, next) {
  		
      //req.session.authredirect = config.paths.authRedirect;
      if (req.param('r') != null && req.session) {
      	req.session.authredirect = req.param('r');
      }
      
      // Detect if the login and callback domains don't match, 
      // in which case we pass the encrypted sessionId with the request
      if (req.host !== config.getProxy().host) {
      	
      	req.requestId = auth.encryptSessionState(req.sessionID);
      	req.requestIdParam = 'state';
      	
      	debug('prepareSession: requestId=' + req.requestId);
      }
      
      next();
    };
  },
  
  validateSession: function(provider) {
  	return function(req, res, next) {
  		
  		// Check for 'state' in the callback url, which we'll  
  		// decrypt into a sessionId for replacing our session
  		var requestId = req.query.state || null,
  			sessionState;
  		
  		if (requestId) {
  			debug('validateSession: requestId=' + requestId);
  			
  			sessionState = auth.decryptSessionState(requestId);
  			
  			if (sessionState) {
  				debug('validateSession: sessionState:', sessionState);
  				
  				if (sessionState.timestamp && (Date.now() - sessionState.timestamp) < auth._sessionTimeout) {
  					
		      	// Retrieve original session object	
						req.sessionStore.get(sessionState.sessionId, function(err, sess) {
		  				debug('validateSession: sessionStore.get:', sessionState.sessionId);
		  				
		  				if (!err && sess && sess.passport) {
		  					// Replace current session object with original session object
		  					req.sessionStore.createSession(req, sess);
		  					
		  					// Link original sessionId to this session
		  					req.session.originalId = sessionState.sessionId;
		  					
		  					debug('validateSession: createSession:', req.sessionID);
		  					
		  					// If passport user data is missing, re-login the user
		  					if (!req.isAuthenticated()) {
			  					req.logIn(sess.passport.user, function(err) {	
			  						debug('validateSession: req.logIn');
			  						next();
			  					});
			  				} else {
			  					next();
			  				}
		  				} else {
		  					next();
		  				}
		  			});
		  			
  				} else {
  					next(new Error('Session state has timed out.'));
  				}
  			} else {
  				next(new Error('Missing or invalid session state.'));
  			}
      	
  		} else {
  			next();
  		}
  	};
  },
  
  /**
   * Encrypt the sessionId into a unique requestId hash. 
   * 
   * Hash is comprised of (sessionId + timestamp), which should be unique 
   * per request, helps maintains state, allows the timestamp to be validated, 
   * and helps prevent CSRF. 
   * 
   * <pre>{SESSION_ID}:t:{TIMESTAMP} -> {REQUEST_ID}</pre>
   * 
   * @param {String} sessionId The sessionId to maintain across requests.
   * 
   * @return {String} The encrypted state hash.
   */
  encryptSessionState: function(sessionId) {
  	var requestId = sessionId + ':t:' + Date.now(),
  		cipher = crypto.createCipher('aes-256-cbc', config.session.secret),
  		crypted = cipher.update(requestId, 'utf8', 'hex') + cipher.final('hex');
  	
  	return crypted;
  },
	
  /**
   * Decrypt the requestId hash into a request state object.
   * 
   * Object comprises sessionId and timestamp, which is then used to lookup 
   * and load a session, and validate the time the request was made
   * 
   * @param {String} requestId The state hash to decrypt into a state object.
   * 
   * @return {Object} The state object.
   * <pre>
   * {
   * 	 sessionId: String,
   *   timestamp: Number
   * }
   * </pre>
   */
  decryptSessionState: function(requestId) {
		var decipher = crypto.createDecipher('aes-256-cbc', config.session.secret),
  		decrypted = decipher.update(requestId, 'hex', 'utf8') + decipher.final('utf8'),
  		parts = decrypted && decrypted.split(':t:'),
  		state = null;
  	
  	if (parts && parts.length == 2) {
  		state = {
  			sessionId: parts[0],
  			timestamp: Number(parts[1])
  		};
  	}
  		
  	return state;
  },
  
  authenticateProvider: function(provider, options) {
		options = options || {};
	 
		return function(req, res, next) {
	  	debug('authenticateProvider ' + provider);
	 
			var authOptions = _.extend({}, options, {
					session: false,
					scope: req.query.scope || options.scope || '',
					state: req.query.state || options.state || ''
				}),
				callbackParams = {};
			
			// Attach state to request
	 		if (req.requestId) {
	 			// If OAuth2, use oauth state property
	 			if (options.strategyType == 'OAuth2Strategy') {
	 				authOptions.state = req.requestId;
	 			
	 			// Else append as param to callback url	
	 			} else {
	 				callbackParams[req.requestIdParam || 'state'] = req.requestId;
	 				authOptions.callbackURL = auth.getProviderCallbackUrl(provider, callbackParams);
	 			}
	 		}
	  	
	  	// If force_login=true, add service-specific url param, if supported
			if (req.query.force_login && String(req.query.force_login).toLowerCase() == 'true' && options.forceLoginParam) {
	   		authOptions[options.forceLoginParam.name] = options.forceLoginParam.value;
			}
	   
			passport.authorize(provider, authOptions)(req, res, next);
		};
  },
  
  associate: function(providerData) {
    return function(req, res, next) {
      var user = req.user,
        profile = req.account;
      
      debug('associate ' + profile.provider + '/' + profile.id);

      // Return error if missing provider name or id; won't be able access it otherwise 
      if (!profile.provider || !profile.id) {
        req.apiResponse = new ApiResponse(500, new Error('Profile not associated. Missing provider name or id.'));
        next(); 
        
      // Auth'ed already, associating profile with current user
      } else if (user != null && profile != null) {
        
        // Associate the profile with the user
        userAPI.associateProfile(user, profile, function(apiRes){
          req.apiResponse = apiRes; // Return APIResponse
          next();
        });
      
      // Missing user or profile data, 
      } else {
        req.apiResponse = new ApiResponse(500, new Error('Profile not associated. D\'oh! Shouldn\'t have gotten to the point.'));
        next(); 
      }

    };
  },
  
  prepareAssociation: function(providerData) {
  	if (providerData && providerData.prepareHandler) {
  		return providerData.prepareHandler;
  	} else {
  		return function (req, res, next) { next(); };
  	}
  },
  
  postAssociation: function(providerData) {
  	if (providerData && providerData.postHandler) {
  		return providerData.postHandler;
  	} else {
  		return function (req, res, next) { next(); };
  	}
  },
  
  /**
   * Middleware to verify passport.authorize and make any changes to the profile 
   * before passing it on; assumes already authed
   */
  authzVerify: function(req, provider, accessToken, refreshToken, profile, done){
    profile.authToken = accessToken;
    profile.authTokenSecret = refreshToken;
    
    if (!profile.id) {
      profile.id = profile.username || profile.displayName || null;
    }
    
    debug('authzVerify ' + profile.provider + '/' + profile.id);
    
    return done(null, profile);
  },

  /** 
   * Generic utility to initialize and use different auth Strategies, called by
   * each Strategy implementation.
   */
  useStrategy: function(provider, strategy, options, verify) {
  	// Store the classname of the base strategy type, i.e. 'OAuthStrategy', etc.
  	provider.strategyType = strategy.super_.name || '';
  	
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
      callbackURL: auth.getProviderCallbackUrl(provider.strategy),
      passReqToCallback: true
    }, options);
    
    verify = verify || function(req, accessToken, refreshToken, profile, done) {
      // Invalid signature
      if (arguments.length != 5 || !req || typeof(req) != 'object') {
        return done(new Error('Invalid signature in verify strategy.'), false);
      
      // Associate account with user.
      } else {
        return auth.authzVerify(req, provider, accessToken, refreshToken, profile, done);
      }
    };
    
    auth.useStrategy(provider, strategy, options, verify);
  },

  /**
   * Wrapper for useStrategy() for OpenID Strategy implementations.
   */
  useOpenIDStrategy: function(provider, strategy, options, verify) {
    options = _.extend({
      returnURL: auth.getProviderCallbackUrl(provider.strategy),
      passReqToCallback: true
    }, options);
    
    verify = verify || function(req, identifier, profile, done) {
      // Invalid signature
      if (arguments.length != 4 || !req || typeof(req) != 'object') {
        return done(new Error('Invalid signature in verify strategy.'), false);
    
      // Associate account with user.
      } else {
        return auth.authzVerify(req, provider, identifier, null, profile, done);
      }
    };
    
    auth.useStrategy(provider, strategy, options, verify);
  },

  handleResponse: function(providerData) {
    return function(req, res, next) {
      debug('handleResponse');
      var http = new HttpHelper(req, res),
        apiRes = req.apiResponse || new ApiResponse(),
        redirectParams = '',
        error = null,
        params = {},
        redirectUrl = '';
      
      if (req.session && req.session.authredirect) {
      	
      	redirectUrl = req.session.authredirect;
      	
      	// Internal or HTTP error occurred
        if (apiRes.isError()) {
          error = {
          	code: 'multipass_error',
          	message: apiRes.message, 
          	status: apiRes.getHTTPStatus()
          };
        // OAuth error occurred
        } else if (req.query.error) {
        	error = {
          	code: req.query.error,
          	message: req.query.error_description || ''
         };
        }
        // If error, pass to callback as serialized query param
        if (error) {
        	params.multipass_error = JSON.stringify( error );
        }
        
        // Set account data to pass back in redirect params
        if (req.account && req.account.provider) {
        	params.provider = req.account.provider;
        	params.providerId = req.account.id;
        }
        
        // Determine if account requires extended auth, and set redirect param
        if (!_.isUndefined(providerData.isExtendedAuth)) {
        	if (_.isFunction(providerData.isExtendedAuth)) {
        		params.extendedAuth = providerData.isExtendedAuth(req.account);
        	} else {
        		params.extendedAuth = Boolean(providerData.isExtendedAuth);
        	}
        }
        
        // Add querystring to redirect url
        if (!_.isEmpty(params)) {
        	redirectUrl += (redirectUrl.indexOf('?') == -1 ? '?' : '&') + querystring.stringify(params);
        }
        
        debug('redirect ' + redirectUrl);
        res.redirect(redirectUrl);
        
      } else {
        http.send(apiRes);
      }
    };
  },
  
  getProviderLoginPath: function(strategy) {
    return config.paths.api + '/auth/' + String(strategy).toLowerCase();
  },

  getProviderCallbackPath: function(strategy) {
    return this.getProviderLoginPath(strategy) + '/callback';
  },
  
  getProviderCallbackUrl: function(strategy, params) {
  	var callbackPath = this.getProviderCallbackPath(strategy),
  		callbackUrl = config.getBaseUrl() + callbackPath,
  		url = '';
  		
  	if (config.paths.authCallback) {
  		url = config.paths.authCallback;
  		url = String(url).replace('{{url}}', encodeURIComponent(callbackUrl));
  		url = String(url).replace('{{path}}', callbackPath);
  		callbackUrl = url;
  	}
  	
  	if (params) {
  		callbackUrl += (callbackUrl.indexOf('?') === -1 ? '?' : '&') 
  			+ urlUtil.format({query:params}).substr(1);
  	}
  	
  	return callbackUrl;
  },
  
  getAuthzStrategy: function(strategy) {
      return strategy + '-authz';
  },
  
  addProvider: function(provider) {
    this.providers.push(provider);
  },
  
  getProvidersData: function() {
  	return this.providers.map(function (provider, i) {
  		return {
  			'provider': provider.strategy,
        'loginUrl': auth.getProviderLoginPath(provider.strategy)
  		};
  	});
  },
  
  loadProviders: function(app) {
    var auth = this;
    
    if (config && config.providers) {
      Object.keys(config.providers).forEach(function(key) {
        var provider = require('./providers/' + String(key).toLowerCase()).provider;
        if (provider) {
          // Add provider to list of available providers
          auth.addProvider(provider);
        }
      });
    }
  },

  authenticateApp: function(options){
    options = _.extend({
      session: true,    // Store auth credentials in session
      forceAuth: true   // Force re-authentication, even if auth credentials exist in session
    }, options);
    
    return function(req, res, next){
      //console.log('authenticateApp', req.user);
      if (!req.isAuthenticated() || options.forceAuth) {
        debug('authenticateApp: forceAuth='+options.forceAuth, 'isAuth='+req.isAuthenticated());
        passport.authenticate(auth._appAuthStrategy, options)(req, res, next);
      } else {
        debug('authenticateApp: pass (skip auth)');
        next();
      }
    };
  },
  
  loadAppProvider: function(strategy) {
    this._appAuthStrategy = strategy;
    
    var provider = require('./providers/' + String(strategy).toLowerCase()).provider;
    if (provider) console.log('Using app auth provider "'+strategy+'"');
    else console.log('Error loading app auth provider "'+strategy+'"');
  },
  
  loadProviderRoutes: function(app) {
  	if (auth.providers.length) {
  		
  		// Assign login and callback routes for provider
  		auth.providers.forEach(function (provider) {
        
        // Login route
        app.get(auth.getProviderLoginPath(provider.strategy),
          HttpHelper.validate(auth.validateRules),
          auth.prepareSession(provider.strategy),
          auth.authenticateApp({ session:true, forceAuth:false }),
          auth.authenticateProvider(provider.strategy, provider)
        );
  
  			// Callback route
        app.get(auth.getProviderCallbackPath(provider.strategy),
          [HttpHelper.validate(auth.validateRules),
           auth.validateSession(provider.strategy),
           auth.authenticateApp({ forceAuth:false }),
           auth.authenticateProvider(provider.strategy, provider),
           auth.prepareAssociation(provider),
           auth.associate(provider),
           auth.postAssociation(provider),
           auth.handleResponse(provider)]
        );
  		});
  	}
  }
  
};

module.exports = auth;