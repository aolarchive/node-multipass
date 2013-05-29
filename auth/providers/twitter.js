var config = require('../../conf/config')
  , auth = require('../index')
  , TwitterStrategy = require('passport-twitter').Strategy;


var provider = {
  strategy: 'twitter',
  scope: null,
  forceLoginParam: {
  	name: 'forceLogin',
  	value: 'true'
  }
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
    
    // Associate account with user.
    return auth.authzVerify(req, provider, token, tokenSecret, profile, done);
  }
);

module.exports.provider = provider;
