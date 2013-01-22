(function($) {

  /*
   * Set up configuration items and global functions
   */
  
  var options = {
    userId: 'multipass:test',
    appId: 'bcca4c62-dbbc-4b22-a3c5-7bdb96fca106',
    appSecret: '3470a522d81c77f9b48133df779841f1'
  };
  
  $.ajaxSetup({
    headers: {
      'Authorization': 'Basic ' + btoa(options.appId + ':' + options.appSecret),
      'X-Multipass-User': options.userId
    }
  });

  function showResponse(data) {
    data = JSON.stringify(data);
    var content = (js_beautify && js_beautify(data, { indent_size:2 })) || data;
    
    $('.response-dialog').html(content).dialog({
      width: '50%'
    }).show();
  }
  
  /*
   * Set up event listeners and code on DOM ready
   */
  
  $(document).ready(function(){
    
    /*
     * Auth Profile Management
     * URL: /
     */
    
    $('a.user-logout').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        url = $this.data('url');
      
      $.ajax({
        url: url,
        type: 'get'
      })
      .done(function(data){
        if (data.status == 'Ok') {
          location.href = $this.attr('href');
        } else {
          showResponse(data);
        }
      });
    });

    $('.user-table a.user-read').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        url = $this.attr('href');
      
      $.ajax({
        url: url,
        type: 'get'
      })
      .done(function(data){
        showResponse(data);
      });
    });
    
    $('.user-table a.user-remove').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        url = $this.data('url');
      
      $.ajax({
        url: url,
        type: 'post',
        data: { '_method': 'delete' }
      })
      .done(function(data){
        if (data.status == 'Ok') {
          location.href = $this.attr('href');
        } else {
          showResponse(data);
        }
      });
    });

    $('.profile-table a.profile-read').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        url = $this.attr('href');
      
      $.ajax({
        url: url,
        type: 'get'
      })
      .done(function(data){
        showResponse(data);
      });
    });
    
    $('.profile-table a.profile-remove').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        url = $this.data('url');
      
      $.ajax({
        url: url,
        type: 'post',
        data: { '_method': 'delete' }
      })
      .done(function(data){
        if (data.status == 'Ok') {
          location.href = $this.attr('href');
        } else {
          showResponse(data);
        }
      });
    });
    
    /*
     * App Management
     * URL: /app
     */
      
    $('#app-submit').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        appId = $('#app-appId').val() || '',
        url = '/api/app',
        hosts = String($('#app-hosts').val()).split(/\s*[;,\n]\s*/),
        data = {
          userId: $('#app-userId').val() || '',
          name: $('#app-name').val() || '',
          description: $('#app-description').val() || '',
          hosts: hosts || []
        },
        message = 'App created!';
      
      // Update
      if (appId) {
        $.extend(data, {
          appId: appId,
          '_method': 'put'
        });
        message = 'App updated!';
      
      // Create
      } else {
        
      }
      
      $.ajax({
        url: url,
        type: 'post',
        data: JSON.stringify(data),
        contentType: 'application/json'
      })
      .done(function(data){
        if (data.status == 'Ok') {
          alert(message);
          location.href = '/app';
        } else {
          alert("Error creating/updating the app");
        }
      });
    });
    
    $('#app-delete').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        appId = $('#app-appId').val() || '',
        url = '/api/app',
        data = {
          appId: appId,
          '_method': 'delete'
        };
      
      $.ajax({
        url: url,
        type: 'post',
        data: JSON.stringify(data),
        contentType: 'application/json'
      })
      .done(function(data){
        if (data.status == 'Ok') {
          alert("App deleted!");
          location.href = '/app';
        } else {
          alert("Error deleting the app");
        }
      });
    });
    
    $('#app-refresh').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        appId = $('#app-appId').val() || '',
        url = '/api/app/secret',
        data = {
          appId: appId
        };
      
      $.ajax({
        url: url,
        type: 'post',
        data: JSON.stringify(data),
        contentType: 'application/json'
      })
      .done(function(data){
        if (data.status == 'Ok') {
          alert("App secret refreshed!");
          location.reload();
        } else {
          alert("Error refreshing the app secret");
        }
      });
    });
    
  });
  
}(jQuery));