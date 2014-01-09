var swagger = require('../../swagger')
	, resources = require('./swagger/resources')
	, models = require('./swagger/models');
 

module.exports = {
  
  name: 'app',
  
  views: 'views/',
  
  init: function(app, options) {
  	//console.log('plugin:'+this.name, this, options);
  	swagger.addModels(models);
  	swagger.addResources(resources);
  },
  
  routes: function(app) {
    // Init routes here
    require('./routes')(app);
  }
  
};
