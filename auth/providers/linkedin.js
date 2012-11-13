var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , LinkedInStrategy = require('passport-linkedin').Strategy;


var provider = {
  strategy: 'linkedin',
  scope: null
};

passport.use(provider.strategy,
  new LinkedInStrategy({
      consumerKey: config.providers.linkedin.consumerKey,
      consumerSecret: config.providers.linkedin.consumerSecret,
      callbackURL: config.paths.base + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(token, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        profile.authToken=token;
        userAPI.addOrUpdateUser(profile, token, function(obj){
          return done(null, obj);
        });
      });
    }
  )
);

passport.use(auth.getAuthzStrategy(provider.strategy),
  new LinkedInStrategy({
      consumerKey: config.providers.linkedin.consumerKey,
      consumerSecret: config.providers.linkedin.consumerSecret,
      callbackURL: config.paths.base + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(token, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        profile.authToken=token;
        return done(null, profile);
      });
    }
  )
);

module.exports.provider = provider;
