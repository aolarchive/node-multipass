var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , GitHubStrategy = require('passport-github').Strategy;


var provider = {
  strategy: 'github',
  scope: null
};

passport.use(provider.strategy,
  new GitHubStrategy({
      clientID: config.providers.github.clientId,
      clientSecret: config.providers.github.clientSecret,
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
  new GitHubStrategy({
      clientID: config.providers.github.clientId,
      clientSecret: config.providers.github.clientSecret,
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
