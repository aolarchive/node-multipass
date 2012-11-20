var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , AOLStrategy = require('passport-aol-oauth').Strategy;


var provider = {
  strategy: 'aol',
  scope: null
};

passport.use(provider.strategy,
  new AOLStrategy({
      clientID: config.providers.aol.clientId,
      clientSecret: config.providers.aol.clientSecret,
      callbackURL: config.getBaseUrl() + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        profile.authToken=accessToken;
        userAPI.addOrUpdateUser(profile, accessToken, function(obj){
          return done(null, obj);
        });
      });
    }
  )
);

passport.use(auth.getAuthzStrategy(provider.strategy),
  new AOLStrategy({
      clientID: config.providers.aol.clientId,
      clientSecret: config.providers.aol.clientSecret,
      callbackURL: config.getBaseUrl() + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        profile.authToken=accessToken;
        return done(null, profile);
      });
    }
  )
);

module.exports.provider = provider;
