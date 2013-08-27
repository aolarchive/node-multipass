 
module.exports = {
  
  name: 'app',
  
  views: 'views/',
  
  init: function(app, options) {
  	//console.log('plugin:'+this.name, this, options);
  },
  
  routes: function(app) {
    // Init routes here
    require('./routes')(app);
  }
  
};
