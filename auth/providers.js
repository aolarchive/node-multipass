var passport = require('passport')
  , config = require('../config.js')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , userProfile = require('../data/user');


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use('facebook', new FacebookStrategy({
    clientID: config.providers.facebook.appId,
    clientSecret: config.providers.facebook.appSecret,
    callbackURL: config.baseUrl + "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      profile.authToken = accessToken;
      userProfile.loadProfile(profile, accessToken, function(obj){
          return done(null, obj);
      });
    });
  }
));

passport.use('facebook-authz', new FacebookStrategy({
    clientID: config.providers.facebook.appId,
    clientSecret: config.providers.facebook.appSecret,
    callbackURL: config.baseUrl + "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      profile.authToken = accessToken;
      return done(null, profile);
    });
  }
));


//Use the TwitterStrategy within Passport.
//Strategies in passport require a `verify` function, which accept
//credentials (in this case, a token, tokenSecret, and Twitter profile), and
//invoke a callback with a user object.
passport.use('twitter', new TwitterStrategy({
   consumerKey: config.providers.twitter.consumerKey,
   consumerSecret: config.providers.twitter.consumerSecret,
   callbackURL: config.baseUrl + "/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
   // asynchronous verification, for effect...
   process.nextTick(function () {
     profile.authToken = token;
     userProfile.loadProfile(profile, token, function(obj){
         return done(null, obj);
     });
   });
  }
));

passport.use('twitter-authz', new TwitterStrategy({
  consumerKey: config.providers.twitter.consumerKey,
  consumerSecret: config.providers.twitter.consumerSecret,
  callbackURL: config.baseUrl + "/auth/twitter/callback"
 },
 function(token, tokenSecret, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function () {
    profile.authToken = token;
    return done(null, profile);
  });
 }
));


exports = ['facebook', 'twitter'];