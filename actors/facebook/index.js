 
module.exports = {
  
  name: 'facebook',
  
  actor: null,
  
  init: function(app) {
    // Init the app here...
    this.actor = require('./facebook');
  },
  
  routes: function(app) {
    // Init routes here
    require('./routes')(app);
  }
  
};
