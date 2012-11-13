(function($) {
  
  $(document).ready(function(){
    
    $('a.user-logout').click(function(event){
      event.preventDefault();
      
      var $this = $(this),
        url = $this.data('url');
      
      $.ajax({
        url: url,
        type: 'get'
      })
      .done(function(data){
        location.href = $this.attr('href');
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
        location.href = $this.attr('href');
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
        location.href = $this.attr('href');
      });
    });
    
  });
  
}(jQuery));