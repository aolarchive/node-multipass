var config = require('../../conf/config')
  , auth = require('../index')
  , AOLStrategy = require('passport-aol-oauth').Strategy;


var provider = {
  strategy: 'aol',
  scope: null
};

auth.useOAuthStrategy(provider, AOLStrategy, {
  clientID: config.providers.aol.clientId,
  clientSecret: config.providers.aol.clientSecret
});

module.exports.provider = provider;
