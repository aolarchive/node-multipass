 
module.exports = {
  
  name: 'twitter',
  
  actor: null,
  
  init: function(app) {
    // Init the app here...
    this.actor = require('./twitter');
  },
  
  routes: function(app) {
    // Init routes here
    require('./routes')(app);
  }
  
};
