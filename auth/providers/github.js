var config = require('../../conf/config')
  , auth = require('../index')
  , GitHubStrategy = require('passport-github').Strategy;


var provider = {
  strategy: 'github',
  scope: null
};

auth.useOAuthStrategy(provider, GitHubStrategy, {
  clientID: config.providers.github.clientId,
  clientSecret: config.providers.github.clientSecret
});

module.exports.provider = provider;
