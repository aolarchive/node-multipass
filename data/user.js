var mongoose = require('mongoose')
  , config = require('../conf/config')
  , Schemas = require('./schemas')
  , uuid = require('node-uuid');


var User = mongoose.model('User', Schemas.User, config.mongo.collection);


function buildUser(profile, authToken) {
  profile = profile || {};
  var userProfile = buildUserProfile(profile, authToken);

  var user = new User({
    userId : uuid.v4(),
    creationDate : Date.now(),
    modifiedDate : Date.now()
  });
  user.profiles.push(userProfile);

  return user;
};

function buildUserProfile(profile, authToken){
  profile = profile || {};
  var data = { 
      provider : profile.provider,
      providerId : profile.id,
      username : profile.username,
      displayName : profile.displayName,
      familyName : profile.familyName,
      givenName : profile.givenName,
      gender : profile.gender,
      profileUrl : profile.profileUrl,
      authToken : authToken,
      emails : profile.emails,
      creationDate : Date.now(),
      modifiedDate : Date.now()
  };
  return data;
};

function findProfile(user, provider, providerId, authToken) {
  var profiles = user.profiles,
    matchingProfile = null;
  
  for (var i=0; i < profiles.length; i++) {
    if (profiles[i].provider == provider && profiles[i].providerId == providerId) {
      matchingProfile = profiles[i];
      break;
    }
  }
  
  return matchingProfile;
};

var userAPI = {
  
  addOrUpdateUser : function(profile, authToken, callback) {
    profile = profile || {};
    User.findOne({'profiles.provider':profile.provider, 'profiles.providerId':profile.id},
      function(err, user){
        // Error in the request
        if (err) {
          callback(err);
            
        // Matching user found, update authToken    
        } else if (user) {
          var matchingProfile = findProfile(user, profile.provider, profile.id, authToken);
          if (matchingProfile != null) {
            matchingProfile.authToken = authToken;
            matchingProfile.modifiedDate = Date.now();
            user.modifiedDate = Date.now();
            user.markModified('profiles');
            user.save(function(err,doc){
              callback(doc);
            });
          } else {
            callback(user);
          }
          
        // No user found, create user  
        } else {
          var newUser = buildUser(profile, authToken);
          newUser.save(function(err,doc) {
            callback(doc);
          });
        }
      }
    );
  },
  
  getUser : function(userId, callback) {
    User.findOne({'userId':userId},
      function(err, doc){
        if (err) {
          callback(err);
        } else {
          callback(doc);
        }
      }
    );
  },
  
  removeUser : function(userId, callback) {
    User.remove({'userId':userId},
      function(err, doc){
        if (err) {
          callback(err);
        } else {
          callback(doc);
        }
      }
    );
  },
  
  getProfile : function(user, provider, providerId, callback) {
    this.getUser(user.userId,
      function(u){
        var userProfile = findProfile(u, provider, providerId);
        callback(userProfile);
      }
    );
  },
  
  addProfile : function(user, profile, authToken, callback) {
    this.getUser(user.userId,
      function(u){
        var userProfile = buildUserProfile(profile, authToken);
        u.profiles.push(userProfile);
        u.modifiedDate = Date.now();
        u.markModified('profiles');
        u.save(function(err,doc) {
            callback(doc);
        });
      }
    );
  },

  removeProfile : function(user, provider, providerId, callback) {
    this.getUser(user.userId,
      function(u){
        var matchingProfile = findProfile(u, provider, providerId, authToken);
        if (matchingProfile != null) {
          matchingProfile.remove();
          u.save(function(err,doc) {
            if (err) {
              callback(err);
            } else {
              callback(doc);
            }
          });
        } else {
          callback(u);
        }
      }
    );
  },
  /*
  findProfile : function(profile, callback) {
    UserProfile.findOne({'provider':profile.provider, 'providerId':profile.id},
      function(err, doc){
        if (err) {
          callback(err);
        } else {
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
  */  
};

module.exports = userAPI;