var config = require('../../conf/config')
  , auth = require('../index')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


var provider = {
  strategy: 'google',
  scope: ['https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'],
  forceLoginParam: {
  	name: 'prompt',
  	value: 'select_account'
  }
};

auth.useOAuthStrategy(provider, GoogleStrategy, {
  clientID: config.providers.google.clientId,
  clientSecret: config.providers.google.clientSecret
});

module.exports.provider = provider;
