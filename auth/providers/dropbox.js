var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , DropboxStrategy = require('passport-dropbox').Strategy;


var provider = {
  strategy: 'dropbox',
  scope: null
};

passport.use(provider.strategy,
  new DropboxStrategy({
      consumerKey: config.providers.dropbox.consumerKey,
      consumerSecret: config.providers.dropbox.consumerSecret,
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
  new DropboxStrategy({
      consumerKey: config.providers.dropbox.consumerKey,
      consumerSecret: config.providers.dropbox.consumerSecret,
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
