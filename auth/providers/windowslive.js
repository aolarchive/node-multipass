var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , WindowsLiveStrategy = require('passport-windowslive').Strategy;


var provider = {
  strategy: 'windowslive',
  scope: ['wl.signin', 'wl.basic']
};

passport.use(provider.strategy,
  new WindowsLiveStrategy({
      clientID: config.providers.windowslive.clientId,
      clientSecret: config.providers.windowslive.clientSecret,
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
  new WindowsLiveStrategy({
      clientID: config.providers.windowslive.clientId,
      clientSecret: config.providers.windowslive.clientSecret,
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
