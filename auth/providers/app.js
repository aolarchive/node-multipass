var config = require('../../conf/config')
  , auth = require('../index')
  , AppStrategy = require('../strategies/app')
  , appAPI = require('../../data/app');


var provider = {
  strategy: 'app',
  scope: null
};

auth.useStrategy(provider, AppStrategy, {
    passReqToCallback: true
  },
  function(req, appId, appSecret, userId, done) {
    
    var host = req.get('host'),
      context = {
        appId: appId,
        userId: userId
      };
    
    // Validate auth credentials
    appAPI.authenticateApp(appId, appSecret, host, function(apiRes) {
      if (apiRes.isError()) {
        // Return error
        return done(apiRes.getData());
      } else if (!apiRes.getData()) {
        // Credentials did not match, so not authorized
        return done(null, false);
      } else {
        // Match found, authorized, return user context data
        return done(null, context);
      }
    });
    
  }
);

module.exports.provider = provider;