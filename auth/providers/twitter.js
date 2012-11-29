var config = require('../../conf/config')
  , auth = require('../index')
  , TwitterStrategy = require('passport-twitter').Strategy;


var provider = {
  strategy: 'twitter',
  scope: null
};

auth.useOAuthStrategy(provider, TwitterStrategy, {
    consumerKey: config.providers.twitter.consumerKey,
    consumerSecret: config.providers.twitter.consumerSecret
  },
  function(req, token, tokenSecret, profile, done) {
    // Normalize some data
    if (profile.displayName == null){
      profile.displayName = profile.username;
    }   
    // Not logged in. Load user.
    if (!req.user) {
      return auth.authVerify(provider, token, tokenSecret, profile, done);
    // Logged in. Associate account with user.
    } else {
      return auth.authzVerify(provider, token, tokenSecret, profile, done);
    }
  }
);

module.exports.provider = provider;
