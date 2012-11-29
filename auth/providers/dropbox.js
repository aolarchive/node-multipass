var config = require('../../conf/config')
  , auth = require('../index')
  , DropboxStrategy = require('passport-dropbox').Strategy;


var provider = {
  strategy: 'dropbox',
  scope: null
};

auth.useOAuthStrategy(provider, DropboxStrategy, {
  consumerKey: config.providers.dropbox.consumerKey,
  consumerSecret: config.providers.dropbox.consumerSecret
});

module.exports.provider = provider;
