 
module.exports = {
  
  name: 'tumblr',
  
  actor: null,
  
  init: function(app) {
    // Init the app here...
    this.actor = require('./tumblr');
  },
  
  routes: function(app) {
    // Init routes here
    require('./routes')(app);
  }
  
};
