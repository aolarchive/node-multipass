(function($) {

  var multipass = {

    options: {
      apiBaseUrl: location.protocol + '//' + location.host,
      userId: 'multipass:demo',
      appId: 'bcca4c62-dbbc-4b22-a3c5-7bdb96fca106',
      appSecret: '3470a522d81c77f9b48133df779841f1',
      authCallback: '_multipassCallback_'
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
      
      window[this.options.authCallback] = $.proxy(multipass.initUi, multipass);
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
    
    getTumblrBlogs: function(providerId, callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/actors/tumblr/' + providerId + '/user/blogs'
      };
      
      this.apiRequest(options, callback);
    },
    
    submitTumblrBlogPost: function(providerId, hostname, title, body, callback) {
      var options = {
        url: this.options.apiBaseUrl + '/api/actors/tumblr/' + providerId + '/user/blogs/' + encodeURIComponent(hostname) + '/post',
        type: 'post',
        data: JSON.stringify({ 'title': title, 'body': body })
      };
      
      this.apiRequest(options, callback);
    },
    
    openCrossPost: function() {
      var providerData = {};
      
      // Collect provider data from post-enabled profiles
      $('.mp-profiles tr').each(function(i, el){
        if (i > 0) {
          var $el = $(el),
            data;
        
          if ($el.hasClass('mp-post-enabled')) {
            data = $el.data();
            providerData[data.provider] = data;
          }
        }
      });
      
      multipass.getTumblrBlogs(providerData.tumblr.providerId, function(data){
        var content = '<select class="mp-tumblr-blog" title="Choose a blog">';
        $.each(data, function(i, blog){
          content += '<option value="'+blog.baseHostname+'">'+blog.baseHostname+'</option>';
        });
        content += '</select>'
          +'<input type="text" class="mp-tumblr-title" title="Post title" />'
          + '<textarea class="mp-tumblr-body" rows="6" title="Post body"></textarea>';
        
        $('.mp-dialog').html(content).dialog({
          title: 'Send cross post',
          dialogClass: 'mp-form-dialog',
          width: 500,
          maxWidth: 500,
          modal: true,
          buttons: {
            Submit: function() {
              var body = $('.mp-tumblr-body').val(),
                title = $('.mp-tumblr-title').val(),
                hostname = $('.mp-tumblr-blog').val();
              
              if (body.length) {
                $('.mp-dialog').dialog( "option", "buttons", null );
                
                multipass.submitTumblrBlogPost(providerData.tumblr.providerId, hostname, title, body, function(data){
                  // Add short delay between posts
                  setTimeout(function(){
                    var status = title + ' - ' + body;
                    
                    // Send same post to Twitter
                    multipass.updateTwitterStatus(providerData.twitter.providerId, status, function(data){
                      $('.mp-dialog').html('<p>Cross post sent successfully to Tumblr and Twitter.</p>').dialog({
                        Cancel: function() {
                          $( this ).dialog( "destroy" );
                        }
                      });
                    });
                    
                  }, 500);
                  
                });
              }
            },
            Cancel: function() {
              $( this ).dialog( "destroy" );
            }
          }
        })
        .show();
      });
    },
    
    buildProfiles: function() {
      this.getProfiles(function(data){
        var $profiles = $('.mp-profiles tbody'),
          actionsCell;
        
        // Remove any exisiting profile rows
        $profiles.find('tr.mp-profile').remove();
        
        // Build each profile row from data
        $.each(data, function(i, profile){
          $profiles.append(
            $('<tr/>').append(
              $('<td/>').append($('<span class="mp-icon mp-'+profile.provider+'" />'), $('<a/>', {
                'class': 'mp-profile-read',
                href: '#',
                text: profile.provider,
                click: function(event) {
                  event.preventDefault();
                  
                  var providerData = $(event.target).closest('tr').data(),
                    provider = providerData.provider,
                    providerId = providerData.providerId;
                  
                  multipass.getProfile(provider, providerId, function(data, options) {
                    multipass.showResponse(options.url, data);
                  });
                }
              })),
              $('<td/>').append(                  
                (profile.displayName || '') + (profile.username ? ' ('+profile.username+')' : '')
              ),
              actionsCell = $('<td/>').append($('<a/>', {
                'class': 'mp-profile-remove',
                href: '#',
                text: 'Remove',
                click: function(event) {
                  event.preventDefault();
                  
                  var providerData = $(event.target).closest('tr').data(),
                    provider = providerData.provider,
                    providerId = providerData.providerId;
                  
                  if (window.confirm("Are you sure you want to remove providerId '"+provider+':'+providerId+"'?")) {
                    multipass.removeProfile(provider, providerId, function(data) {
                      multipass.buildProfiles();
                    });
                  }
                }
              }))
            )
            .addClass('mp-profile')
            .toggleClass('mp-post-enabled', (profile.provider == 'twitter' || profile.provider == 'tumblr'))
            .data({
              provider: profile.provider,
              providerId: profile.providerId
            })
          );
          
          // If twitter provider, add tweet button
          if (profile.provider == 'twitter') {
            actionsCell.append(' | ',
              $('<a/>', {
                'class': 'mp-twitter-update',
                href: '#',
                text: 'Send Tweet',
                click: function(event) {
                  event.preventDefault();
                  
                  var providerData = $(event.target).closest('tr').data(),
                    provider = providerData.provider,
                    providerId = providerData.providerId,
                    content = '<textarea class="mp-twitter-field" rows="3" maxlength="140" title="Status update"></textarea>',
                    twitterHandle = '@' + profile.username;
                  
                  $('.mp-dialog').html(content).dialog({
                    title: 'Send tweet as ' + twitterHandle,
                    dialogClass: 'mp-form-dialog',
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
          // If Tumblr provider, add post button
          } else if (profile.provider == 'tumblr') {
            actionsCell.append(' | ',
              $('<a/>', {
                'class': 'mp-tumblr-post',
                href: '#',
                text: 'Submit Post',
                click: function(event) {
                  event.preventDefault();
                  
                  var providerData = $(event.target).closest('tr').data(),
                    provider = providerData.provider,
                    providerId = providerData.providerId,
                    content = '';
                  
                  multipass.getTumblrBlogs(providerId, function(data){
                    content += '<select class="mp-tumblr-blog" title="Choose a blog">';
                    $.each(data, function(i, blog){
                      content += '<option value="'+blog.baseHostname+'">'+blog.baseHostname+'</option>';
                    });
                    content += '</select>'
                      +'<input type="text" class="mp-tumblr-title" title="Post title" />'
                      + '<textarea class="mp-tumblr-body" rows="6" title="Post body"></textarea>';
                    
                    $('.mp-dialog').html(content).dialog({
                      title: 'Submit Tumblr post as ' + profile.username,
                      dialogClass: 'mp-form-dialog',
                      width: 500,
                      maxWidth: 500,
                      modal: true,
                      buttons: {
                        Submit: function() {
                          var body = $('.mp-tumblr-body').val(),
                            title = $('.mp-tumblr-title').val(),
                            hostname = $('.mp-tumblr-blog').val();
                          
                          if (body.length) {
                            $('.mp-dialog').dialog( "option", "buttons", null );
                            
                            multipass.submitTumblrBlogPost(providerId, hostname, title, body, function(data){
                              $('.mp-dialog').html('<p>Post submitted successfully!</p>').dialog({
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
                  });
                }
              })
            );
          }
        });
      });
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
      
      this.buildProfiles();
      
    },
    
    initAuth: function() {
      var parent = window.opener || window.parent;
      
      if (window != parent) {
        parent[this.options.authCallback] && parent[this.options.authCallback]();
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
    
    // Demo app
    if ($('.mp-demo').length) {
      multipass.initUi();

      $('.mp-user-remove').click(function(event){
        event.preventDefault();
        
        if (window.confirm("Are you sure you want to remove this user and all its profiles?")) {
          multipass.removeUser(function(data, options){
            multipass.initUi();
          });
        }
      });
      
      $('.mp-profiles-cross-post').click(function(event){
        event.preventDefault();
        
        multipass.openCrossPost();
      });
    
    // Auth handler window
    } else if ($('.mp-auth').length) {
      multipass.initAuth();
    }
    
  });
  
  return multipass;
  
}(jQuery));