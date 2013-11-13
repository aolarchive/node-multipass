var OAuth = require('oauth').OAuth
  , config = require('../../conf/config')
  , userAPI = require('../../data/user')
  , ApiResponse = require('../../data/apiresponse')
  , urlUtil = require('url')
  , debug = require('debug')(config.name + ':actors:twitter');


var tumblrActor = {
    
    provider: 'tumblr',
    
    oauth: (function() {
      var localConfig = (config.providers && config.providers.tumblr) || {};
      
      return new OAuth(
        "http://www.tumblr.com/oauth/request_token",
        "http://www.tumblr.com/oauth/access_token",
        localConfig.consumerKey,
        localConfig.consumerSecret,
        "1.0",
        null,
        "HMAC-SHA1"
      );
    }()),
    
    getTokens: function(context, providerId, callback) {
      userAPI.getProfile(context, tumblrActor.provider, providerId, true, function(res){
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
    
    getUserInfo: function(context, providerId, callback) {
      
      tumblrActor.getTokens(context, providerId, function(data){
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving tumblr auth token.')));
        } else {
          tumblrActor.oauth.get("http://api.tumblr.com/v2/user/info",
              data.token, data.secret, 
              function (error, data, response2) {
                if (error) {
                  var errorData = JSON.parse(error.data);
                  debug('Error getting tumblr user info for id %s.', providerId);
                  debug(JSON.stringify(error));
                  
                  callback(new ApiResponse(500, new Error(errorData), 'Error getting tumblr user info.'));
                  
                } else {
                  debug('Tumblr user info retrieved for id %s.', providerId);
                  debug(response2);
                  
                  callback(new ApiResponse(JSON.parse(data)));
                }
          });
        }
      });
      
    },
    
    getBlogs: function(context, providerId, callback) {
      
      this.getUserInfo(context, providerId, function(res){
        if (res.isError()) {
          callback(res);
        } else {
          var user = res.getData().response.user,
            blogs = user.blogs || [];
          
          blogs.forEach(function(blog, i){
            blog.baseHostname = (blog.url && urlUtil.parse(blog.url).hostname) || '';
          });
          
          callback(new ApiResponse(blogs));
        }
      });
      
    },

    postToBlog: function(context, providerId, hostname, title, body, callback) {
    
      tumblrActor.getTokens(context, providerId, function(data){
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving tumblr auth token.')));
        } else {
          var url = 'http://api.tumblr.com/v2/blog/'+hostname+'/post',
            postBody = {
              type: 'text',
              title: title,
              body: body
            };

          tumblrActor.oauth.post(url,
              data.token, data.secret, postBody, "application/json",
              function (error, data, response2) {
                if (error) {
                  var errorData = JSON.parse(error.data);
                  debug('Error posting to tumblr blog for id %s.', providerId);
                  debug(JSON.stringify(error));
                  
                  callback(new ApiResponse(500, new Error(errorData), 'Error submitting tumblr post.'));
                  
                } else {
                  debug('Tumblr post submitted for id %s.', providerId);
                  debug(response2);
                  
                  callback(new ApiResponse(JSON.parse(data)));
                }
          });
        }
      });
      
    }
    
};

module.exports = tumblrActor;