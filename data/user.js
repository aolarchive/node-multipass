var mongoose = require('mongoose')
  , config = require('../conf/config')
  , Schemas = require('./schemas')
  , uuid = require('node-uuid')
  , ApiResponse = require('./apiresponse');


var User = mongoose.model('User', Schemas.User, config.mongo.collection);

var fieldInclusions = { '__v':0 };  // 0==exclude, 1==include

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
      fieldInclusions,
      function(err, user){
        var res = null;
        
        // Error in the request
        if (err) {
          res = new ApiResponse(err, null, 404, 'The profile cannot be found.');
          callback(res);
            
        // Matching user found, update the profile    
        } else if (user) {
          var matchingProfile = findProfile(user, profile.provider, profile.id, authToken);
          
          // Matching profile found, update the authToken
          if (matchingProfile != null) {
            matchingProfile.authToken = authToken;
            matchingProfile.modifiedDate = Date.now();
            user.modifiedDate = Date.now();
            user.markModified('profiles');
            user.save(function(err,doc){
              if (err) {
                res = new ApiResponse(err, null, 500, 'Error updating the profile.');
              } else {
                res = new ApiResponse(null, doc);
              }
              callback(res);
            });
            
          // No profile found, just return user
          } else {
            res = new ApiResponse(null, doc);
            callback(res);
          }
          
        // No user found, create user  
        } else {
          var newUser = buildUser(profile, authToken);
          newUser.save(function(err,doc) {
            if (err) {
              res = new ApiResponse(err, null, 500, 'Error creating the user.');
            } else {
              res = new ApiResponse(null, doc, 201);
            }
            callback(res);
          });
        }
      }
    );
  },
  
  getUser : function(userId, callback) {
    User.findOne({'userId':userId},
      fieldInclusions,
      function(err, doc){
        var res = null;
        if (err) {
          res = new ApiResponse(err, null, 404, 'The user cannot be found.');
        } else {
          res = new ApiResponse(null, doc);
        }
        callback(res);
      }
    );
  },
  
  removeUser : function(userId, callback) {
    User.findOne({'userId':userId},
      fieldInclusions,  
      function(err, doc){
        var res = null;
        if (err) {
          res = new ApiResponse(err, null, 404, 'The user cannot be found.');
          callback(res);
        } else {
          doc.remove(function (err, removedDoc) {
            if (err) {
              res = new ApiResponse(err, null, 500, 'Error deleting the user.');
            } else {
              res = new ApiResponse(null, removedDoc);
            }
            callback(res);
          });
        }
      }
    );
  },
  
  getProfile : function(user, provider, providerId, callback) {
    this.getUser(user.userId,
      function(res){
        if (res.error) {
          callback(res);
        } else {
          var u = res.data,
            userProfile = findProfile(u, provider, providerId);
          
          if (!userProfile) {
            res = new ApiResponse(res, null, 404, 'The profile cannot be found.');
          } else {
            res = new ApiResponse(null, userProfile);
          }
          callback(res);
        }
      }
    );
  },
  
  addProfile : function(user, profile, authToken, callback) {
    this.getUser(user.userId,
      function(res){
        if (res.error) {
          callback(res);
        } else {
          var u = res.data,
            userProfile = buildUserProfile(profile, authToken);
          
          u.profiles.push(userProfile);
          u.modifiedDate = Date.now();
          u.markModified('profiles');
          u.save(function(err,doc) {
            if (err) {
              res = new ApiResponse(err, null, 500, 'Error creating the profile.');
            } else {
              res = new ApiResponse(null, doc, 201);
            }
            callback(res);
          });
        }
      }
    );
  },

  removeProfile : function(user, provider, providerId, callback) {
    this.getUser(user.userId,
      function(res){
        if (res.error) {
          callback(res);
        } else {
          var u = res.data,
            matchingProfile = findProfile(u, provider, providerId);
          
          if (!matchingProfile) {
            res = new ApiResponse(err, null, 404, 'The profile cannot be found.');
            callback(res);
          } else {
            matchingProfile.remove();
            u.save(function(err,doc) {
              if (err) {
                res = new ApiResponse(err, null, 500, 'Error deleting the profile.');
              } else {
                res = new ApiResponse(null, doc);
              }
              callback(res);
            });
          }
        }
      }
    );
  }
  
};

module.exports = userAPI;