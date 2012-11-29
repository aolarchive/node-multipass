var config = require('../../conf/config')
  , auth = require('../index')
  , LinkedInStrategy = require('passport-linkedin').Strategy;


var provider = {
  strategy: 'linkedin',
  scope: null
};

auth.useOAuthStrategy(provider, LinkedInStrategy, {
  consumerKey: config.providers.linkedin.consumerKey,
  consumerSecret: config.providers.linkedin.consumerSecret
});

module.exports.provider = provider;
