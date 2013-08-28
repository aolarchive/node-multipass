(function ($) {

  var multipass = {

    /**
     * Default options; overridden by init call
     */
    options: {
      apiBaseUrl: location.protocol + '//' + location.host,
      userId: '',
      appId: '',
      appSecret: '',
      authCallbackName: '_multipassCallback_',
      authCallbackUrl: location.href.replace(/\#.*$/i, '').replace(/\/[^\/]+$/, '/') + 'auth.html',
      authCallback: function (params) {
				$(document).trigger('multipass-auth', params);
			}
    },
    
    /*
     * Initialization and global functions
     */
    
    /**
     * Initialize the settings.
     * Call this the first time, and any time the options change.
     */
    init: function (customOptions) {
      this.options = $.extend({}, this.options, customOptions);
      
      // Default ajax options
      var ajaxOptions = {
        contentType: 'application/json',
        headers: {}
      };
      
      // Add Authorization header only if appId exists
      if (multipass.options.appId) {
        ajaxOptions.headers['Authorization'] = 'Basic ' + btoa(multipass.options.appId + ':' + multipass.options.appSecret);
      }
      
      $.ajaxSetup(ajaxOptions);
      
      this.setUserId(multipass.options.userId);
      
      if (this.options.authCallbackName) {
        window[this.options.authCallbackName] = $.proxy(this.authWindowCallback, this);
      }
    },
    
    authWindowCallback: function (query) {
      if (this.options.authCallback) {
        var params = null;
				
				if (query) {
					var pairs = query.split('&'),
						len = pairs.length,
						pair;
						
					params = {};
						
					for (var i = 0; i < len; i++) {
						pair = String(pairs[i]).split('=');
						params[pair[0]] = decodeURIComponent(pair[1]);
					}
				}
				
        this.options.authCallback(params);
      }
    },
    
    loginAuthProvider: function (loginUrl, params) {
			params = params || {};
			params.r = this.options.authCallbackUrl;
			params.force_login = true;
			
			var url = this.options.apiBaseUrl + loginUrl + '?' + $.param(params);
			
			window.open(url, 'multipass-auth', 'width=800,height=600');
    },
    
    setUserId: function (userId) {
      if (userId) {
        this.options.userId = userId;
        
        $.ajaxSetup({
          headers: {
            'X-Multipass-User': multipass.options.userId
          }
        });
      }
    },
    
    apiRequest: function (options, callback) {
      options = $.extend({
        type: 'get'
      }, options);
      
      var onRequestError = function (jqXHR, textStatus, errorThrown) {
        var res = {
          statusText: errorThrown
        };
        
        if (jqXHR.responseText && jqXHR.getResponseHeader('content-type').indexOf('json') !== -1) {
          res = JSON.parse(jqXHR.responseText);
        }
        
        if (callback) {
          callback(null, res, options, jqXHR);
        }
      };
      
      $.ajax(options)
      .done(function (data, textStatus, jqXHR) {
        if (data.status === 'Ok') {
          if (callback) {
            callback(data.data, null, options, jqXHR);
          }
        } else {
          onRequestError(jqXHR, data.status, data.statusText);
        }
      })
      .fail(onRequestError);
    },
    
    /*
     * Multipass API functions
     */
    
    getProviders: function (callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/auth/providers'
      };
      
      this.apiRequest(options, callback);
    },
    
    getProfiles: function (callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user'
      };
      
      this.apiRequest(options, function (data, err, options, jqXHR) {
        if (data) {
          callback(data.profiles, err, options, jqXHR);
        } else {
          callback(data, err, options, jqXHR);
        }
      });
    },
    
    getProfile: function (provider, providerId, callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user/' + provider + '/' + providerId
      };
      
      this.apiRequest(options, callback);
    },
    
    removeProfile: function (provider, providerId, callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user/' + provider + '/' + providerId,
        type: 'post',
        data: JSON.stringify({ '_method': 'delete' })
      };
      
      this.apiRequest(options, callback);
    },
    
    removeUser: function (callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user',
        type: 'post',
        data: JSON.stringify({ '_method': 'delete' })
      };
      
      this.apiRequest(options, callback);
    },
    
    addFacebookPages: function (providerId, data, callback) {
			var options = {
				url: this.options.apiBaseUrl + '/api/user/facebook/' + providerId + '/pages',
				type: 'post',
				data: JSON.stringify(data)
			};
			
			this.apiRequest(options, callback);
		}
    
  };
  
  $.multipass = multipass;
  
  return multipass;
  
}(jQuery));