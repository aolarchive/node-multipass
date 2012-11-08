var mongoose = require('mongoose')
    , config = require('../config.js')
    , Schema = require('./schemas.js');


mongoose.connect(config.mongo.data.connection);
var UserProfile = mongoose.model('UserProfile', Schema.UserProfile);


function buildUserProfile(user, authToken){
  var data = { 
      provider : user.provider,
      providerId : user.id,
      username : user.username,
      displayName : user.displayName,
      familyName : user.familyName,
      givenName : user.givenName,
      gender : user.gender,
      profileUrl : user.profileUrl,
      authToken : authToken,
      emails : user.emails,
      created_on : Date.now(),
      updated_on : Date.now()
  };
  return (new UserProfile(data));
};

var profile = {
    
  loadProfile : function(profile, authToken, callback) {
    UserProfile.findOne({'provider':profile.provider, 'providerId':profile.id},
      function(err, doc){
        if (err) {
          callback(err);
        } else if (doc) {
          doc.authToken = authToken;
          doc.markModified('authToken');
          doc.save(function(err,doc){
            debugger;
            callback(doc);
          });
        } else {
          var userProfile = buildUserProfile(profile, authToken);
          userProfile.save(function(err,doc) {
            debugger;
              callback(doc);
          });
        }
      }
    );
  },
  
  findProfile : function(profile, callback) {
    UserProfile.findOne({'provider':profile.provider, 'providerId':profile.id},
      function(err, doc){
        if (err) {
          callback(err);
        } else if (doc) {
          callback(doc);
        }
      }
    );
  },
  
  removeProfile : function(profile, callback) {
    UserProfile.remove({'provider':profile.provider, 'providerId':profile.id},
      function(err, doc){
        if (err) {
          callback(err);
        } else {
          callback(doc);
        }
      }
    );
  },
  
  addProfile : function(profile, authToken, callback) {
    this.findProfile(profile,
      function(doc) {
        if (!doc) {
          var userProfile = buildUserProfile(profile, authToken);
          userProfile.save(function(err,doc) {
              callback(doc);
          });
        } 
      }
    );
  }
    
};

module.exports = profile;