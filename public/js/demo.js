(function($) {

  var multipass = {

    options: {
      apiBaseUrl: 'https://devlocal.aol.com:3443',
      userId: 'multipass:demo',
      appId: 'bcca4c62-dbbc-4b22-a3c5-7bdb96fca106',
      appSecret: '3470a522d81c77f9b48133df779841f1'
    },
      
    init: function(customOptions) {
      this.options = $.extend({}, this.options, customOptions);
      
      $.ajaxSetup({
        contentType: 'application/json',
        headers: {
          'Authorization': 'Basic ' + btoa(multipass.options.appId + ':' + multipass.options.appSecret),
          'X-Multipass-User': multipass.options.userId
        }
      });
    },
    
    getProviders: function(callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/auth/providers'
      };
      
      this.apiRequest(options, callback);
    },
    
    getProfiles: function(callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user'
      };
      
      this.apiRequest(options, function(data) {
        callback(data.profiles);
      });
    },
    
    getProfile: function(provider, providerId, callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user/' + provider + '/' + providerId
      };
      
      this.apiRequest(options, callback);
    },
    
    removeProfile: function(provider, providerId, callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user/' + provider + '/' + providerId,
        type: 'post',
        data: JSON.stringify({ '_method': 'delete' })
      };
      
      this.apiRequest(options, callback);
    },
    
    loginAuthProvider: function(loginUrl) {
      var url = this.options.apiBaseUrl + loginUrl + '?r=auth.html';
      
      var authWin = window.open(url, 'multipass-auth', 'width=800,height=600');
    },
    
    initUi: function() {
      
      $('.mp-userId').text(multipass.options.userId);
      $('.mp-appId').text(multipass.options.appId);
      
      this.getProviders(function(data){
        var $providers = $('.mp-providers').empty();
        
        $.each(data, function(i, value){
          $providers.append(
            $('<li/>').append(
              $('<a/>', {
                'data-url': value.loginUrl,
                href: '#',
                text: value.provider,
                click: function(event) {
                  event.preventDefault();
                  multipass.loginAuthProvider($(event.target).data('url'));
                }
              })
            )  
          );
        });
      });
      
      this.getProfiles(function(data){
        var $profiles = $('.mp-profiles tbody');
        //$profiles.find('tr').remove();
        
        $.each(data, function(i, profile){
          $profiles.append(
            $('<tr/>').append(
              $('<td/>').append(profile.provider),
              $('<td/>').append($('<a/>', {
                'class': 'mp-profile-read',
                href: '#',
                text: profile.providerId,
                click: function() {
                  event.preventDefault();
                  var providerFull = $(event.target).closest('tr').data('providerId').split(':'),
                    provider = providerFull[0],
                    providerId = providerFull[1];
                  
                  multipass.getProfile(provider, providerId, function(data, options) {
                    multipass.showResponse(options.url, data);
                  });
                }
              })),
              $('<td/>').append(profile.username),
              $('<td/>').append(profile.displayName),
              $('<td/>').append((new Date(profile.modifiedDate)).toString()),
              $('<td/>').append($('<a/>', {
                'class': 'mp-profile-remove',
                href: '#',
                text: 'Remove Profile',
                click: function() {
                  event.preventDefault();
                  var providerFull = $(event.target).closest('tr').data('providerId').split(':'),
                    provider = providerFull[0],
                    providerId = providerFull[1];
                  
                  if (window.confirm("Are you sure you want to remove providerId '"+provider+':'+providerId+"'?")) {
                    multipass.removeProfile(provider, providerId, function(data) {
                      location.reload();
                    });
                  }
                }
              }))
            )
            .addClass('mp-profile-'+profile._id)
            .data('providerId', profile.provider + ':' + profile.providerId)
          );
        });
      });
      
    },
    
    initAuth: function() {
      var parent = window.opener || window.parent;
      
      if (window != parent) {
        parent.location.reload();
        window.close();
      }
    },
      
    showResponse: function(url, data) {
      data = JSON.stringify(data);
      var content = (js_beautify && js_beautify(data, { indent_size:2 })) || data;
      
      content = '<p>'+url+'</p>' + content;
      
      $('.response-dialog').html(content).dialog({
        width: '50%'
      }).show();
    },
    
    apiRequest: function(options, callback) {
      options = $.extend({
        type: 'get'
      }, options);
      
      $.ajax(options)
      .done(function(data){
        if (data.status == 'Ok') {
          if (callback) {
            callback(data.data, options);
          }
        } else {
          multipass.showResponse(options.url, data.responseText && JSON.parse(data.responseText));
        }
      })
      .fail(function(data){
        multipass.showResponse(options.url, data.responseText && JSON.parse(data.responseText));
      });
    }
  
  };

  multipass.init();
  
  /*
   * Set up event listeners and code on DOM ready
   */
  $(document).ready(function(){
    
    if ($('.mp-demo').length) {
      multipass.initUi();
      
    } else if ($('.mp-auth').length) {
      multipass.initAuth();
    }
  });
  
  return multipass;
  
}(jQuery));