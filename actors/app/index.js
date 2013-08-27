 
module.exports = {
  
  name: 'app',
  
  views: 'views/',
  
  init: function(app) {
  	//console.log('plugin:'+this.name, this);
  },
  
  routes: function(app) {
    // Init routes here
    require('./routes')(app);
  }
  
};
