var OAuth = require('oauth').OAuth
  , config = require('../../conf/config')
  , userAPI = require('../../data/user')
  , ApiResponse = require('../../data/apiresponse')
  , debug = require('debug')(config.name + ':actors:google')
  , googleapis = require('googleapis')
  , OAuth2Client = googleapis.OAuth2Client;


var googleActor = {
    
    provider: 'google',
    
    oauth: (function() {
      var localConfig = (config.providers && config.providers.google) || {};

     	return new OAuth2Client(
     		localConfig.clientId,
        localConfig.clientSecret,
        null
     	);
    }()),
    
    getTokens: function(context, providerId, callback) {
      userAPI.getProfile(context, googleActor.provider, providerId, function(res){
        if (res.isError()) {
          callback(false);
        } else if (!res.getData()) {
          callback(null);
        } else  {
          var result = {
            token: res.getData().authToken || null,
            secret: res.getData().authTokenSecret || null
          };
          
        	googleActor.oauth.credentials = {
        		access_token: result.token,
  					refresh_token: result.secret
        	};
        	
          callback(result);
        }
      });
    },
    
    getProfile: function(context, providerId, callback) {
    
      googleActor.getTokens(context, providerId, function(data){
        if (!data) {
          callback(new ApiResponse(500, new Error('Error retrieving google auth token.')));
        } else {
        	
         googleapis
         	.discover('plus', 'v1')
         	.execute(function (err, client) {
         		client
         			.plus.people.get({ userId: 'me' })
         			.withAuthClient(googleActor.oauth)
         			.execute(function (err, profile) {
         				if (err) {
							    debug('Error getting google profile for id %s.', providerId);
                  debug(JSON.stringify(err));
							  } else {
							    debug(profile.displayName + ':' + profile.tagline);
							  }
         			});
         	});
        }
      });
      
    }
    
};

module.exports = googleActor;