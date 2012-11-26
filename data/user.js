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

function updateUserProfile(profile, authToken){
  profile = profile || {};
  var data = {
      username : profile.username,
      displayName : profile.displayName,
      familyName : profile.familyName,
      givenName : profile.givenName,
      gender : profile.gender,
      profileUrl : profile.profileUrl,
      authToken : authToken,
      emails : profile.emails,
      modifiedDate : Date.now()
  };
  return data;
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
          res = new ApiResponse(500, err, 'Error retrieving the profile.');
          callback(res);
            
        // Matching user found, update the profile    
        } else if (user) {
          userAPI.updateProfileByUser(user, profile, authToken, callback);
          
        // No user found, create user  
        } else {
          userAPI.addUser(profile, authToken, callback);
        }
      }
    );
  },
  
  /**
   * Responses:
   *  success: [201] The user object that was added.
   */
  addUser : function(profile, authToken, callback) {
    var newUser = buildUser(profile, authToken);
    newUser.save(function(err,doc) {
      var res = null;
      if (err) {
        res = new ApiResponse(500, err, 'Error creating the user.');
      } else {
        res = new ApiResponse(201, doc);
      }
      callback(res);
    });
  },
  
  /**
   * Responses:
   *  success: [200] The user object that was found.
   */
  getUser : function(userId, callback) {
    User.findOne({'userId':userId},
      fieldInclusions,
      function(err, doc){
        var res = null;
        if (err) {
          res = new ApiResponse(500, err, 'Error retriving the user.');
        } else if (!doc) {
          res = new ApiResponse(404, Error('The user cannot be found.'));
        } else {
          res = new ApiResponse(doc);
        }
        callback(res);
      }
    );
  },
  
  /**
   * Responses:
   *  success: [200] The user object that was removed.
   */
  removeUser : function(userId, callback) {
    User.findOne({'userId':userId},
      fieldInclusions,  
      function(err, doc){
        var res = null;
        if (err) {
          res = new ApiResponse(404, err, 'The user cannot be found.');
          callback(res);
        } else {
          doc.remove(function (err, removedDoc) {
            if (err) {
              res = new ApiResponse(500, err, 'Error deleting the user.');
            } else {
              res = new ApiResponse(removedDoc);
            }
            callback(res);
          });
        }
      }
    );
  },
  
  /**
   * Responses:
   *  success: [200] The profile object that was found.
   */
  getProfile : function(user, provider, providerId, callback) {
    this.getUser(user.userId,
      function(res){
        if (res.isError()) {
          callback(res);
        } else {
          var u = res.data,
            userProfile = userAPI.findProfileByUser(u, provider, providerId);
          
          if (!userProfile) {
            res = new ApiResponse(404, Error('The profile cannot be found.'));
          } else {
            res = new ApiResponse(userProfile);
          }
          callback(res);
        }
      }
    );
  },
  
  /**
   * Responses:
   *  success: [201] The profile object that was added.
   */
  addProfile : function(user, profile, authToken, callback) {
    this.getUser(user.userId,
      function(res){
        if (res.isError()) {
          callback(res);
        } else {
          var u = res.data,
            userProfile = buildUserProfile(profile, authToken);
          
          u.profiles.push(userProfile);
          u.modifiedDate = Date.now();
          u.markModified('profiles');
          u.save(function(err,doc) {
            if (err) {
              res = new ApiResponse(500, err, 'Error creating the profile.');
            } else {
              res = new ApiResponse(201, userProfile);
            }
            callback(res);
          });
        }
      }
    );
  },
  
  /**
   * Responses:
   *  success: [200] The profile object that was removed.
   */
  removeProfile : function(user, provider, providerId, callback) {
    this.getUser(user.userId,
      function(res){
        if (res.isError()) {
          callback(res);
        } else {
          var u = res.data,
            matchingProfile = userAPI.findProfileByUser(u, provider, providerId);
          
          if (!matchingProfile) {
            res = new ApiResponse(404, Error('The profile cannot be found.'));
            callback(res);
          } else {
            matchingProfile.remove();
            u.save(function(err,doc) {
              if (err) {
                res = new ApiResponse(500, err, 'Error deleting the profile.');
              } else {
                res = new ApiResponse(matchingProfile);
              }
              callback(res);
            });
          }
        }
      }
    );
  },
  
  /**
   * @returns {UserProfile} The profile object that was found, or null.
   */
  findProfileByUser : function(user, provider, providerId, authToken) {
    var profiles = user && user.profiles,
      matchingProfile = null;
    
    if (profiles && profiles.length) {
      for (var i=0; i < profiles.length; i++) {
        if (profiles[i].provider == provider && profiles[i].providerId == providerId) {
          matchingProfile = profiles[i];
          break;
        }
      }
    }
    
    return matchingProfile;
  },
  
  /**
   * Responses:
   *  success: [200] The user object whose profile was updated.
   */
  updateProfileByUser : function(user, profile, authToken, callback) {
    var matchingProfile = userAPI.findProfileByUser(user, profile.provider, profile.id, authToken),
      res = null;
    
    // Matching profile found, update the profile
    if (matchingProfile != null) {
      
      matchingProfile.set( updateUserProfile(profile, authToken) );
      user.modifiedDate = Date.now();
      user.markModified('profiles');
      
      user.save(function(err,doc){
        if (err) {
          res = new ApiResponse(500, err, 'Error updating the profile.');
        } else {
          res = new ApiResponse(doc);
        }
        callback(res);
      });
  
    // No profile found, return error
    } else {
      res = new ApiResponse(404, Error('The profile cannot be found'));
      callback(res);
    }
  }
  
};

module.exports = userAPI;