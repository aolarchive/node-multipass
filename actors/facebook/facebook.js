var OAuth = require('oauth').OAuth
  , config = require('../../conf/config')
  , userAPI = require('../../data/user')
  , ApiResponse = require('../../data/apiresponse')
  , debug = require('debug')(config.name + ':actors:facebook')
  , graph = require('fbgraph');


var facebookActor = {
    
    provider: 'facebook',
    
    getTokens: function(context, providerId, callback) {
      userAPI.getProfile(context, facebookActor.provider, providerId, function(res){
      	
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
    
    getProfile: function (context, providerId, callback) {
    	
      facebookActor.getTokens(context, providerId, function(data){
      	
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving facebook auth token.')));
        } else {
          
        	graph.setAccessToken(data.token);
        	
        	graph.get(String(providerId), null, function (err, res) {
        		if (err) {
        			callback(new ApiResponse(500, new Error(err), err.message));
        		} else {
        			callback(new ApiResponse(res));
        		}
        	});
        }
      });
      
    },
    
    getPages: function (context, providerId, callback) {
    	
      facebookActor.getTokens(context, providerId, function(data){
      	
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving facebook auth token.')));
        } else {
          
        	graph.setAccessToken(data.token);
        	
        	graph.get(String(providerId) + '/accounts', null, function (err, res) {
        		if (err) {
        			callback(new ApiResponse(500, new Error(err), err.message));
        		} else {
        			callback(new ApiResponse(res));
        		}
        	});
        }
      });
      
    },
    
    postToFeed: function (context, providerId, message, callback) {
    	
      facebookActor.getTokens(context, providerId, function(data){
      	
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving facebook auth token.')));
        } else {
          var wallPost = {
          	message: message
          };
          
        	graph.setAccessToken(data.token);
        	
        	graph.post(providerId + '/feed', wallPost, function (err, res) {
        		if (err) {
        			callback(new ApiResponse(500, new Error(err), err.message));
        		} else {
        			callback(new ApiResponse(res));
        		}
        	});
        }
      });
      
    }
    
};
  
module.exports = facebookActor;  