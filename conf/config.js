
function getConfig() {
  var env = process.env.NODE_ENV || "development",
    conf = {};
  
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
  
  conf.getBaseUrl = function() {
    var port = conf.portPublic || conf.port,
      portStr = (!port || port == 80) ? '' : ':' + port;
    
    return 'http://' + conf.host + portStr;
  };
  
  return conf;
}

module.exports = getConfig();
