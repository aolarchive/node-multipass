 
module.exports = {
  
  name: 'app',
  
  views: 'views/',
  
  actor: null,
  
  init: function(app) {
  	console.log('app._viewsPath', this._viewsPath);
  },
  
  routes: function(app) {
    // Init routes here
    require('./routes')(app);
  }
  
};
