var config = require('../../conf/config')
  , auth = require('../index')
  , YahooStrategy = require('passport-yahoo-oauth').Strategy;


var provider = {
  strategy: 'yahoo',
  scope: null
};

auth.useOAuthStrategy(provider, YahooStrategy, {
  consumerKey: config.providers.yahoo.consumerKey,
  consumerSecret: config.providers.yahoo.consumerSecret
});

module.exports.provider = provider;
