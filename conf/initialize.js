var config = require('./config')
  ,	mongoose = require('mongoose');


function init(app) {
  
  // Store references to useful things
  app.set('config', config);
  app.set('mongoose', mongoose);
  
  mongoose.connect(config.mongo.connection);
  
  mongoose.connection.on('error', console.error.bind(console, 'Data connection error:'));
  mongoose.connection.once('open', function () {
    console.log('Data connection successful to '+config.mongo.connection);
  });
  
  /*
   * Dynamically load plugins, based on config.plugins hash
   */
  
  var plugins = {},
   pluginConfig,
   plugin;
  
  if (config.plugins) {
    try {
      Object.keys(config.plugins).forEach(function (key) {
        pluginConfig = config.plugins[key];
        
        if (pluginConfig.init) {
          plugin = require(pluginConfig.init);
          if (plugin) {
            plugins[key] = plugin;
            
            if (plugin.init) {
              plugin.init(app);
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error: ' + error.message);
    }
  }

  app.set('plugins', plugins);
  
  // Load local routes
  require('../routes/index')(app);
}

module.exports = init;