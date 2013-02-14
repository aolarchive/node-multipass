var OAuth = require('oauth').OAuth
  , config = require('../conf/config')
  , userAPI = require('../data/user')
  , ApiResponse = require('../data/apiresponse');


var twitterActor = {
    
    provider: 'twitter',
    
    oauth: (function() {
      var localConfig = (config.providers && config.providers.twitter) || {};
      
      return new OAuth(
        "https://api.twitter.com/oauth/request_token",
        "https://api.twitter.com/oauth/access_token",
        localConfig.consumerKey,
        localConfig.consumerSecret,
        "1.0",
        null,
        "HMAC-SHA1"
      );
    }()),
    
    getTokens: function(context, providerId, callback) {
      userAPI.getProfile(context, twitterActor.provider, providerId, function(res){
        if (res.isError()) {
          callback(false);
        } else if (!res.getData()) {
          callback(null);
        } else  {
          var result = {
            token: res.getData().authToken || null,
            secret: res.getData().authTokenSecret || null
          };
          callback(result);
        }
      });
    },
    
    updateStatus: function(context, providerId, status, callback) {
    
      twitterActor.getTokens(context, providerId, function(data){
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving twitter auth token.')));
        } else {
          var body = {'status': status},
            out;

          twitterActor.oauth.post("http://api.twitter.com/1/statuses/update.json",
              data.token, data.secret, body, "application/json",
              function (error, data, response2) {
                if (error) {
                  var errorData = JSON.parse(error.data);
                  console.log('Error: Something is wrong.\n'+JSON.stringify(error)+'\n');
                  
                  callback(new ApiResponse(500, new Error(errorData), 'Error updating twitter status.'));
                  
                } else {
                  console.log('Twitter status updated.\n');
                  console.log(response2+'\n');
                  
                  callback(new ApiResponse(JSON.parse(data)));
                }
          });
        }
      });
      
    },
    
    getTimeline: function(context, providerId, callback) {
      
      twitterActor.getTokens(context, providerId, function(data){
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving twitter auth token.')));
        } else {
          var out;

          twitterActor.oauth.get("https://api.twitter.com/1.1/statuses/home_timeline.json",
              data.token, data.secret, 
              function (error, data, response2) {
                if (error) {
                  var errorData = JSON.parse(error.data);
                  console.log('Error: Something is wrong.\n'+JSON.stringify(error)+'\n');
                  
                  callback(new ApiResponse(500, new Error(errorData), 'Error getting twitter timeline.'));
                  
                } else {
                  console.log('Twitter timeline retrieved.\n');
                  console.log(response2+'\n');
                  
                  callback(new ApiResponse(JSON.parse(data)));
                }
          });
        }
      });
      
    }
    
};

module.exports = twitterActor;