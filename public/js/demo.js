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
    
    removeUser: function(callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/user',
        type: 'post',
        data: JSON.stringify({ '_method': 'delete' })
      };
      
      this.apiRequest(options, callback);
    },
    
    loginAuthProvider: function(loginUrl) {
      var url = this.options.apiBaseUrl + loginUrl + '?r=auth.html';
      
      var authWin = window.open(url, 'multipass-auth', 'width=800,height=600');
    },

    updateTwitterStatus: function(providerId, status, callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/actors/twitter/' + providerId + '/status',
        type: 'post',
        data: JSON.stringify({ 'status': status })
      };
      
      this.apiRequest(options, callback);
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
        var $profiles = $('.mp-profiles tbody'),
          actionsCell;
        //$profiles.find('tr').remove();
        
        $.each(data, function(i, profile){
          $profiles.append(
            $('<tr/>').append(
              $('<td/>').append(profile.provider),
              $('<td/>').append($('<a/>', {
                'class': 'mp-profile-read',
                href: '#',
                text: profile.providerId,
                click: function(event) {
                  event.preventDefault();
                  var providerFull = $(event.target).closest('tr').data('providerId').split(':'),
                    provider = providerFull[0],
                    providerId = providerFull[1];
                  
                  multipass.getProfile(provider, providerId, function(data, options) {
                    multipass.showResponse(options.url, data);
                  });
                }
              })),
              $('<td/>').append(                  
                profile.displayName + (profile.username ? ' ('+profile.username+')' : '')
              ),
              //$('<td/>').append((new Date(profile.modifiedDate)).toString()),
              actionsCell = $('<td/>').append($('<a/>', {
                'class': 'mp-profile-remove',
                href: '#',
                text: 'Remove',
                click: function(event) {
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
          
          if (profile.provider == 'twitter') {
            actionsCell.append(' | ',
              $('<a/>', {
                'class': 'mp-profile-tweet',
                href: '#',
                text: 'Send Tweet',
                click: function(event) {
                  event.preventDefault();
                  var providerFull = $(event.target).closest('tr').data('providerId').split(':'),
                    provider = providerFull[0],
                    providerId = providerFull[1],
                    content = '<textarea class="mp-twitter-field" rows="3" maxlength="140"></textarea>',
                    twitterHandle = '@' + profile.username;
                  
                  $('.mp-dialog').html(content).dialog({
                    title: 'Send tweet as ' + twitterHandle,
                    dialogClass: 'mp-twitter-dialog',
                    width: 500,
                    maxWidth: 500,
                    modal: true,
                    buttons: {
                      Submit: function() {
                        var status = $('.mp-twitter-field').val();
                        if (status.length) {
                          $('.mp-dialog').dialog( "option", "buttons", null );
                          
                          multipass.updateTwitterStatus(providerId, status, function(data){
                            $('.mp-dialog').html('<p>Tweet sent successfully!</p>').dialog({
                              Cancel: function() {
                                $( this ).dialog( "destroy" );
                              }
                            });
                          });
                        }
                      },
                      Cancel: function() {
                        $( this ).dialog( "destroy" );
                      }
                    }
                  }).show();
                }
              })
            );
          }
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
      
      $('.mp-dialog').html(content).dialog({
        width: '50%',
        dialogClass: 'mp-response-dialog',
        title: 'API Response',
        close: function() {
          $( this ).dialog( "destroy" );
        }
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
    
    $('.mp-user-remove').click(function(event){
      event.preventDefault();
      
      if (window.confirm("Are you sure you want to remove this user and all its profiles?")) {
        multipass.removeUser(function(data, options){
          location.reload();
        });
      }
    });
    
  });
  
  return multipass;
  
}(jQuery));