var config = require('../../conf/config')
  , auth = require('../index')
  , TumblrStrategy = require('passport-tumblr').Strategy;


var provider = {
  strategy: 'tumblr',
  scope: null,
  isExtendedAuth: true
};

auth.useOAuthStrategy(provider, TumblrStrategy, {
  consumerKey: config.providers.tumblr.consumerKey,
  consumerSecret: config.providers.tumblr.consumerSecret
});

module.exports.provider = provider;
