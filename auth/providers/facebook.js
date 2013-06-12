var config = require('../../conf/config')
  , auth = require('../index')
  , facebookActor = require('../../actors/facebook/facebook')
  , FacebookStrategy = require('passport-facebook').Strategy;


var provider = {
  strategy: 'facebook',
  scope: ['email'],
  forceLoginParam: {
  	name: 'auth_type',
  	value: 'reauthenticate'
  },
  
  isExtendedAuth: function (profile) {
  	return (profile && profile.metaData && profile.metaData.pages && profile.metaData.pages.length);
  },
  
  /*
   Facebook Pages
    "data": [{
        "category": "Community",
        "name": "Jeremy Tester's App Page",
        "access_token": "{ACCESS_TOKEN}",
        "id": "194676927348958",
        "perms": ["ADMINISTER", "EDIT_PROFILE", "CREATE_CONTENT", "MODERATE_CONTENT", "CREATE_ADS", "BASIC_ADMIN"]
    }],
    "paging": {
        "next": "https://graph.facebook.com/100005622129389/accounts?access_token={ACCESS_TOKEN}&limit=5000&offset=5000&__after_id=194676927348958"
    }
   */
  prepareHandler: function (req, res, next) {
  	var context = req.user,
  		profile = req.account;
  	
  	if (req.apiResponse && req.apiResponse.isError()) {
  		next();
  		
  	} else if (context && profile && profile.authToken) {
  		
			facebookActor._getAccounts(profile.id, profile.authToken, function (pagesRes) {
				if (pagesRes.isError()) {
					req.apiResponse = pagesRes;
					next();
					
				} else {
					var data = pagesRes.getData();
						
					if (data && data.data && data.data.length) {	
						req.account.metaData = {
							type: 'user',
							pages: data.data
						};
						next();
					}
				}
			});
			
  	} else {
  		next();
  	}
  }
  
};

auth.useOAuthStrategy(provider, FacebookStrategy, {
  clientID: config.providers.facebook.appId,
  clientSecret: config.providers.facebook.appSecret
});

module.exports.provider = provider;
