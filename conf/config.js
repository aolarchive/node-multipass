var _ = require('underscore')._;


function getConfig() {
  var env = process.env.NODE_ENV || "development",
    conf = {};
  
  /**
   * Pull in config based on current environment
   */
  if (env == "development"){
      conf = require('./dev.js');
  }
  else if (env == "stage"){
      conf = require('./stage.js');
  }
  else if (env == "production"){
      conf = require('./prod.js');
  }
  else if (env == "heroku"){
    conf = require('./heroku.js');
  }
  
  /**
   * Helper function to build the base URL
   */
  conf.getBaseUrl = function() {
    var proxy = conf.getProxy(), 
      port = proxy.port,
      portStr = (!port || port == 80 || port == 443) ? '' : ':' + port;
    
    return (proxy.https ? 'https' : 'http') + '://' + proxy.host + portStr;
  };
  
  /**
   * Helper functions to get normalized server properties
   */
  conf.getServer = function() {
    return _.extend({
      port: 3000,
      host: '127.0.0.1',
      https: false
    }, 
    conf.server);
  };
  
  conf.getProxy = function() {
    return _.extend(conf.getServer(), conf.proxy);
  };
  
  conf.hasProxy = function() {
    return (conf.proxy && conf.getProxy().port != conf.getServer().port);
  };
  
  return conf;
}

module.exports = getConfig();
