(function($) {

  var demo = {

    updateTwitterStatus: function(providerId, status, callback) {
      var options = {
        url: $.multipass.options.apiBaseUrl + '/api/actors/twitter/' + providerId + '/status',
        type: 'post',
        data: JSON.stringify({ 'status': status })
      };
      
      $.multipass.apiRequest(options, callback);
    },
    
    getTumblrBlogs: function(providerId, callback) {
      var options = {
        url: $.multipass.options.apiBaseUrl + '/api/actors/tumblr/' + providerId + '/user/blogs'
      };
      
      $.multipass.apiRequest(options, callback);
    },
    
    submitTumblrBlogPost: function(providerId, hostname, title, body, callback) {
      var options = {
        url: $.multipass.options.apiBaseUrl + '/api/actors/tumblr/' + providerId + '/user/blogs/' + encodeURIComponent(hostname) + '/post',
        type: 'post',
        data: JSON.stringify({ 'title': title, 'body': body })
      };
      
      $.multipass.apiRequest(options, callback);
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
      
      demo.getTumblrBlogs(providerData.tumblr.providerId, function(data){
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
                
                demo.submitTumblrBlogPost(providerData.tumblr.providerId, hostname, title, body, function(data){
                  // Add short delay between posts
                  setTimeout(function(){
                    var status = title + ' - ' + body;
                    
                    // Send same post to Twitter
                    demo.updateTwitterStatus(providerData.twitter.providerId, status, function(data){
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
      if (!$.multipass.options.userId) {
        return;
      }
      
      var $profiles = $('.mp-profiles tbody');  
    
      // Remove any exisiting profile rows
      $profiles.find('tr.mp-profile').remove();
      
      $('.mp-profiles-list').hide();
      $('.mp-profiles-empty').show();
      $('.mp-user-remove').hide();
      $('.mp-user-empty').show();
      
      $.multipass.getProfiles(function(data, err){
        if (err || !data) {
          return;
        }
        
        var actionsCell;
        
        $('.mp-profiles-list').show();
        $('.mp-profiles-empty').hide();
        $('.mp-user-remove').show();
        $('.mp-user-empty').hide();
        
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
                  
                  $.multipass.getProfile(provider, providerId, function(data, err, options) {
                    demo.showResponse(options.url, data);
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
                    $.multipass.removeProfile(provider, providerId, function(data) {
                      demo.buildProfiles();
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
                          
                          demo.updateTwitterStatus(providerId, status, function(data){
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
                  
                  demo.getTumblrBlogs(providerId, function(data){
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
                            
                            demo.submitTumblrBlogPost(providerId, hostname, title, body, function(data){
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
    
    buildProviders: function() {
      if (!$.multipass.options.userId) {
        return;
      }
      $.multipass.getProviders(function(data){
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
                  $.multipass.loginAuthProvider($(event.target).data('url'));
                }
              })
            )  
          );
        });
      });
    },
    
    initUi: function(params) {
    	var userId = $.multipass.options.userId;
    	
    	$('.mp-user-form').show();
    	
      $('.mp-userId').text(userId)
        .toggle(Boolean(userId));
      
      $('.mp-user-container').toggle(Boolean(userId));
      
      $('.mp-user-form input, .mp-user-form button').toggle($('#mp-login').data('auth') && location.hash === '#full');
      
      this.buildProviders();
      
      this.buildProfiles();
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
    }
  
  };
  
  $.multipass.init({
  	apiBaseUrl: location.protocol + '//' + location.host + '/demo',
  	authCallbackUrl: location.protocol + '//' + location.host + '/auth.html',
  });
  
  $(document).on('multipass-auth', function (event, params) {
  	demo.initUi(params);
  });
  
  /*
   * Set up event listeners and code on DOM ready
   */
  $(document).ready(function(){
    
    // Demo app
    if ($('.mp-demo').length) {
      demo.initUi();
      
      $('.mp-user-form').submit(function(event){
        $('#mp-submit').click();
        return false;
      });
      
      $('#mp-submit').click(function(event){
        if ($('#mp-userId-input').val() != '') { 
          $.multipass.setUserId($('#mp-userId-input').val());
          demo.initUi();
        }
      });
      
      $('.mp-user-remove').click(function(event){
        event.preventDefault();
        
        if (window.confirm("Are you sure you want to remove this user and all its profiles?")) {
          $.multipass.removeUser(function(data, options){
            demo.initUi();
          });
        }
      });
      
      $('.mp-profiles-cross-post').click(function(event){
        event.preventDefault();
        
        demo.openCrossPost();
      });
      
			$('#mp-login').multiAuth({
				devId: 'ao1acmCLPhksv0zu',
				successUrl: location.protocol + '//' + location.host + '/demo/authreceiver.html',
				getTokenCallback: function (json) {
					
					if (json.response.statusCode == 200) {
						$(this.authLink)
							.html('Logout (' + json.response.data.userData.attributes.displayName +')')
							.data('auth', true);
						$.multipass.setUserId(json.response.data.userData.attributes.loginId);
					} else {
						$(this.authLink)
							.html('Login')
							.data('auth', false);
						$.multipass.setUserId('');
					}
					
          demo.initUi();
				}
			});
    
    }
    
  });
  
  return demo;
  
}(jQuery));