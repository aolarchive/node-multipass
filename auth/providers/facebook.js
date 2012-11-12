var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , FacebookStrategy = require('passport-facebook').Strategy;


var provider = {
  strategy: 'facebook',
  scope: ['email']
};

passport.use(provider.strategy,
  new FacebookStrategy({
      clientID: config.providers.facebook.appId,
      clientSecret: config.providers.facebook.appSecret,
      callbackURL: config.paths.base + auth.getProviderCallbackUrl(provider.strategy)
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
  new FacebookStrategy({
      clientID: config.providers.facebook.appId,
      clientSecret: config.providers.facebook.appSecret,
      callbackURL: config.paths.base + auth.getProviderCallbackUrl(provider.strategy)
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
