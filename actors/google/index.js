 
module.exports = {
  
  name: 'google',
  
  actor: null,
  
  init: function(app) {
    // Init the app here...
    this.actor = require('./google');
  },
  
  routes: function(app) {
    // Init routes here
    //require('./routes')(app);
  }
  
};
