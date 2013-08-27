var mongoose = require('mongoose')
  , config = require('../conf/config')
  , Schemas = require('./schemas')
  , uuid = require('node-uuid')
  , crypto = require('crypto')
  , ApiResponse = require('./apiresponse');


var App = mongoose.model('App', Schemas.App, 'apps');

var fieldInclusions = { '__v':0, 'secret':0 };  // 0==exclude, 1==include

function buildApp(app) {
  
  var appModel = new App({
    appId: uuid.v4(),
    secret: generateSecret(),
    hosts: app.hosts,
    userId: app.userId,
    name: app.name,
    description: app.description,
    creationDate: Date.now(),
    modifiedDate: Date.now()
  });

  return appModel;
};

function generateSecret() {
  var buff = crypto.randomBytes(16);
  
  return buff.toString('hex');
};


var appAPI = {

    getApp: function(appId, callback){
      App.findOne({'appId': App.encrypt(appId)},
        fieldInclusions,
        function(err, doc){
          var res = null;
          if (err) {
            res = new ApiResponse(500, err, 'Error retriving the app.');
          } else if (!doc) {
            res = new ApiResponse(404, Error('The app cannot be found.'));
          } else {
            res = new ApiResponse(doc);
          }
          callback(res);
        }
      );
    },
    
    addApp: function(app, callback) {
      var newApp = buildApp(app);
      newApp.save(function(err,doc) {
        var res = null;
        if (err) {
          res = new ApiResponse(500, err, 'Error creating the app.');
          callback(res);
        } else {
          appAPI.getApp(App.decrypt(doc.appId), function(newRes){
            if (newRes.isError()) {
              callback(newRes);
            } else {
              res = new ApiResponse(201, newRes.getData());
              callback(res);
            }
          });
        }
      });
    },
    
    deleteApp: function(appId, callback){
      this.getApp(appId, function(res){
        if (res.isError()) {
          callback(res);
        } else {
          var doc = res.getData();
          
          doc.remove(function (err, removedDoc) {
            if (err) {
              res = new ApiResponse(500, err, 'Error deleting the app.');
            } else {
              res = new ApiResponse(removedDoc);
            }
            callback(res);
          });
        }
      });
    },
    
    updateApp: function(app, callback){
      this.getApp(app.appId, function(res){
        if (res.isError()) {
          callback(res);
        } else {
          var appDoc = res.getData();
        
          appDoc.set({
            hosts: app.hosts,
            userId: app.userId,
            name: app.name,
            description: app.description,
            modifiedDate: Date.now()
          });
          
          appDoc.save(function(err,doc) {
            if (err) {
              res = new ApiResponse(500, err, 'Error updating the app.');
              callback(res);
            } else {
              appAPI.getApp(App.decrypt(doc.appId), function(newRes){
                if (newRes.isError()) {
                  callback(newRes);
                } else {
                  res = new ApiResponse(newRes.getData());
                  callback(res);
                }
              });
            }
          });
        }
      });
    },
    
    authenticateApp: function(appId, secret, host, callback) {
      if (host) {
        // Strip off any ports for now
        host = (String(host).split(':'))[0];
      } else {
        host = '';
      }
      
      App.findOne({'appId':App.encrypt(appId), 'secret':App.encrypt(secret), 'hosts': host },
        fieldInclusions,
        function(err, doc){
          var res = null;
          if (err) {
            res = new ApiResponse(500, err, 'Error retriving the app.');
          } else {
            res = new ApiResponse(doc);
          }
          callback(res);
        }
      );
    },
    
    refreshAppSecret: function(appId, callback){
      this.getApp(appId, function(res){
        if (res.isError()) {
          callback(res);
        } else {
          var appDoc = res.getData();
          
          appDoc.set({
            secret: generateSecret(),
            modifiedDate: Date.now()
          });
          
          appDoc.save(function(err,doc) {
            if (err) {
              res = new ApiResponse(500, err, 'Error updating the app.');
              callback(res);
            } else {
              appAPI.getApp(App.decrypt(doc.appId), function(newRes){
                if (newRes.isError()) {
                  callback(newRes);
                } else {
                  res = new ApiResponse(newRes.getData());
                  callback(res);
                }
              });
            }
          });
        }
      });
    },
    
    getAppsByUserId: function(userId, callback) {
      App.find({'userId':userId},
        fieldInclusions,
        function(err, docs){
          var res = null;
          if (err) {
            res = new ApiResponse(500, err, 'Error retriving the apps.');
          } else {
            res = new ApiResponse(docs);
          }
          callback(res);
        }
      );
    }

};

module.exports = appAPI;