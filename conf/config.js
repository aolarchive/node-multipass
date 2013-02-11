var _ = require('underscore')._;


function getConfig() {
  var env = process.env.NODE_ENV || "development",
    confOverride = process.env.MULTIPASS_CONF || '',
    confFile = '',
    conf = {};
  
  /**
   * Pull in config based on current environment
   */
  try {
    if (confOverride) {
      confFile = confOverride;
    }
    else if (env == "development"){
      confFile = './dev.js';
    }
    else if (env == "stage"){
      confFile = './stage.js';
    }
    else if (env == "production"){
      confFile = './prod.js';
    }
    
    if (confFile) {
      conf = require(confFile);
      console.log('Using config file at ' + confFile);
    } else {
      throw new Error('No config file specified.');
    }
  } catch (e) {
    throw new Error('Error loading config file at ' + confFile);
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
