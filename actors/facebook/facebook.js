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
    
    /*
    debugToken: function (context, providerId, callback) {
    	facebookActor.getTokens(context, facebookActor.provider, providerId, function(data){
      	
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving facebook auth token.')));
        } else {
          
        	//graph.setAccessToken(data.token);
        	var params = {
        		access_token: data.token,
        		input_token: data.token
        	};
        	
        	graph.get('debug_token', params, function (err, res) {
        		if (err) {
        			callback(new ApiResponse(500, new Error(err.message)));
        		} else {
        			callback(new ApiResponse(res));
        		}
        	});
        }
      });
    },
    */
    getProfile: function (context, providerId, callback) {
    	
      facebookActor.getTokens(context, providerId, function(data){
      	
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving facebook auth token.')));
        } else {
          
        	graph.setAccessToken(data.token);
        	
        	graph.get(String(providerId), null, function (err, res) {
        		if (err) {
        			callback(new ApiResponse(500, new Error(err.message)));
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
          facebookActor._getAccounts(providerId, data.token, callback);
        }
      });
      
    },
    
    /**
     * Post to a User or Page Facebook feed.
     * 
		 * @param {Object} context
		 * @param {String} providerId
		 * @param {Object} postData
		 * @param {Function} callback
     */
    postToFeed: function (context, providerId, postData, callback) {
    	
      facebookActor.getTokens(context, providerId, function(data){
      	
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving facebook auth token.')));
          
        } else {
        	facebookActor._postToFeed(providerId, data.token, postData, callback);
        }
      });
      
    },
    
    // TODO: Fix issue where submitting this twice with same data, just returns
    // the User object on each request after the first.
    addPageProfiles: function(context, providerId, profiles, callback) {
    	if (profiles.length) {

				// Get the user facebook profile that contains stored pages data	
				userAPI.getProfile(context, facebookActor.provider, providerId, function (getRes) {
					if (getRes.isError()) {
						callback(getRes);
						
					} else {
						var userProfile = getRes.getData(),
							pageProfile, userPages, foundPages, foundPage, 
							assocPages = [];
						
						if (userProfile.metaData && userProfile.metaData.pages && userProfile.metaData.pages.length) {
							userPages = userProfile.metaData.pages;
							
							// Iterate over all the profiles to add
							profiles.forEach(function (profile, profileIndex) {

								foundPages = userPages.filter(function (page) {
									return page.id === profile.id;
								});
								
								// Found stored page data
								if (foundPages.length) {
									foundPage = foundPages[0];
									
									// Build profile object to add
									pageProfile = {
										provider: facebookActor.provider,
										id: foundPage.id,
										authToken: foundPage.access_token,
										displayName: foundPage.name,
										metaData: {
											type: 'page',
											perms: foundPage.perms
										}
									};
									
									if (profile.displayName) {
										pageProfile.displayName = profile.displayName;
									};
									
									// Associate profile with user.
									// Executes callback once all profiles have been processed.
									userAPI.associateProfile(context, pageProfile, function (assocRes) {
										if (assocRes.isError()) {
											callback(assocRes);
											
										} else {
											assocPages.push(assocRes.getData());
										} 
										
										if (profileIndex === (profiles.length - 1)) {
											callback(new ApiResponse(assocPages));
										}
									});
									
								} else {
									callback(new ApiResponse(500, new Error('Error finding facebook page in profile.')));
								}
																
							});
							
						} else {
							callback(new ApiResponse(500, new Error('Error: No facebook pages in profile.')));
						}
						
					}
				});
			} else {
				callback(new ApiResponse(400, new Error('Must provide page profile data with request.')));
			}
    },
    
    _getAccounts: function (id, accessToken, callback) {
    	
  		graph.setAccessToken(accessToken);
      	
    	graph.get(String(id) + '/accounts', null, function (err, res) {
    		if (err) {
    			callback(new ApiResponse(500, new Error(err.message)));
    		} else {
    			callback(new ApiResponse(res));
    		}
    	});
  	},
  	
  	/**
  	 * Post to a User or Page Facebook feed.
  	 * 
     * Required permissions:
     *   User feed: publish_actions
     *   Page feed: manage_pages, status_update
     * 
		 * @param {String} id
		 * @param {String} accessToken
		 * @param {Object} postData
		 * @param {Function} callback
  	 */
  	_postToFeed: function (id, accessToken, postData, callback) {
  		
  		graph.setAccessToken(accessToken);
        	
    	graph.post(String(id) + '/feed', postData, function (err, res) {
    		if (err) {
    			callback(new ApiResponse(500, new Error(err.message)));
    		} else {
    			callback(new ApiResponse(res));
    		}
    	});
  	}
    
};
  
module.exports = facebookActor;  