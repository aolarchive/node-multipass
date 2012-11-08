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
  created_on : Date,
  updated_on : Date
});

exports.UserProfile = UserProfile;
