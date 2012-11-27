var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
 

var UserProfile = new Schema({
  provider : {type: String, lowercase: true},
  providerId : String,
  username: String,
  displayName : String,
  familyName : String,
  givenName : String,
  gender : String,
  profileUrl : String,
  authToken : String,
  emails : [],
  originalUserId: String,
  creationDate: Date,
  modifiedDate: Date
});

var User = new Schema({
  userId : {type: String, unique: true},
  profiles : [UserProfile],
  linkedUsers : [String],
  creationDate: Date,
  modifiedDate: Date
});


exports.User = User;
exports.UserProfile = UserProfile;
