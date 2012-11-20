var passport = require('passport')
  , config = require('../../conf/config')
  , auth = require('../index')
  , userAPI = require('../../data/user')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


var provider = {
  strategy: 'google',
  scope: ['https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email']
};

passport.use(provider.strategy,
  new GoogleStrategy({
      clientID: config.providers.google.clientId,
      clientSecret: config.providers.google.clientSecret,
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
  new GoogleStrategy({
      clientID: config.providers.google.clientId,
      clientSecret: config.providers.google.clientSecret,
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
