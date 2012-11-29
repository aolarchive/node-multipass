var config = require('../../conf/config')
  , auth = require('../index')
  , WindowsLiveStrategy = require('passport-windowslive').Strategy;


var provider = {
  strategy: 'windowslive',
  scope: ['wl.signin', 'wl.basic']
};

auth.useOAuthStrategy(provider, WindowsLiveStrategy, {
  clientID: config.providers.windowslive.clientId,
  clientSecret: config.providers.windowslive.clientSecret
});

module.exports.provider = provider;
