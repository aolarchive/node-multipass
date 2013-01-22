var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , encryption = require('./encryption')
  , config = require('../conf/config');
 

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

UserProfile.plugin(encryption, { 
  fields: ['authToken'], 
  key: config.mongo.secret, 
  input: 'utf8',
  output: 'base64' 
});

var User = new Schema({
  userId : {type: String, unique: true},
  appId: String,
  profiles : [UserProfile],
  linkedUsers : [String],
  creationDate: Date,
  modifiedDate: Date
});

var App = new Schema({
  appId: {type: String, unique: true},
  secret: String,
  hosts: [String],
  userId: String,
  name: String,
  description: String,
  creationDate: Date,
  modifiedDate: Date
});

App.plugin(encryption, { 
  fields: ['appId', 'secret'], 
  key: config.mongo.secret, 
  input: 'utf8',
  output: 'base64' 
});

exports.User = User;
exports.UserProfile = UserProfile;
exports.App = App;
