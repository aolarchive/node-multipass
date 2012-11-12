var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , TwitterStrategy = require('passport-twitter').Strategy;


var provider = {
  strategy: 'twitter',
  scope: null
};

passport.use(provider.strategy,
  new TwitterStrategy({
      consumerKey: config.providers.twitter.consumerKey,
      consumerSecret: config.providers.twitter.consumerSecret,
      callbackURL: config.paths.base + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(token, tokenSecret, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        if (profile.displayName == null){
            profile.displayName = profile.username;
        }
        profile.authToken=token;
        userAPI.addOrUpdateUser(profile, token, function(obj){
          return done(null, obj);
        });
      });
    }
  )
);

passport.use(auth.getAuthzStrategy(provider.strategy),
  new TwitterStrategy({
      consumerKey: config.providers.twitter.consumerKey,
      consumerSecret: config.providers.twitter.consumerSecret,
      callbackURL: config.paths.base + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(token, tokenSecret, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        if (profile.displayName == null){
            profile.displayName = profile.username;
        }
        profile.authToken=token;
        return done(null, profile);
      });
    }
  )
);

module.exports.provider = provider;
