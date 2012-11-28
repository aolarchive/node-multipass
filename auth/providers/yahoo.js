var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , YahooStrategy = require('passport-yahoo-oauth').Strategy;


var provider = {
  strategy: 'yahoo',
  scope: null
};

passport.use(provider.strategy,
  new YahooStrategy({
      consumerKey: config.providers.yahoo.consumerKey,
      consumerSecret: config.providers.yahoo.consumerSecret,
      callbackURL: config.getBaseUrl() + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(token, tokenSecret, profile, done) {
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
  new YahooStrategy({
      consumerKey: config.providers.yahoo.consumerKey,
      consumerSecret: config.providers.yahoo.consumerSecret,
      callbackURL: config.getBaseUrl() + auth.getProviderCallbackUrl(provider.strategy)
    },
    function(token, tokenSecret, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        profile.authToken=token;
        return done(null, profile);
      });
    }
  )
);

module.exports.provider = provider;
