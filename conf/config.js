
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
    return 'http://' + conf.host + ':' + conf.port;
  };
  
  return conf;
}

module.exports = getConfig();
