var OAuth = require('oauth').OAuth
  , config = require('../conf/config')
  , userAPI = require('../data/user')
  , ApiResponse = require('../data/apiresponse')
  , urlUtil = require('url');


var tumblrActor = {
    
    provider: 'tumblr',
    
    oauth: (function() {
      return new OAuth(
        "http://www.tumblr.com/oauth/request_token",
        "http://www.tumblr.com/oauth/access_token",
        config.providers.tumblr.consumerKey,
        config.providers.tumblr.consumerSecret,
        "1.0",
        null,
        "HMAC-SHA1"
      );
    }()),
    
    getTokens: function(context, providerId, callback) {
      userAPI.getProfile(context, tumblrActor.provider, providerId, function(res){
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
                  console.log('Error: Something is wrong.\n'+JSON.stringify(error)+'\n');
                  
                  callback(new ApiResponse(500, new Error(errorData), 'Error getting tumblr user info.'));
                  
                } else {
                  console.log('Tumblr user info retrieved.\n');
                  console.log(response2+'\n');
                  
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
                  console.log('Error: Something is wrong.\n'+JSON.stringify(error)+'\n');
                  
                  callback(new ApiResponse(500, new Error(errorData), 'Error submitting tumblr post.'));
                  
                } else {
                  console.log('tumblr post submitted.\n');
                  console.log(response2+'\n');
                  
                  callback(new ApiResponse(JSON.parse(data)));
                }
          });
        }
      });
      
    }
    
};

module.exports = tumblrActor;