
function getConfig() {
  var env = process.env.NODE_ENV || "development",
    conf = null;
  
  if (env == "development"){
      conf = require('./dev.js');
  }
  else if (env == "stage"){
      conf = require('./stage.js');
  }
  else if (env == "production"){
      conf = require('./prod.js');
  }
  
  return conf;
}

module.exports = getConfig();
