var config = require('./config')
  ,	mongoose = require('mongoose')
  , dataHelper = require('../data/helper')
  , util = require('util')
  , path = require('path')
  , plugin = require('./plugin');


function init(app) {
  
  // Store references to useful things
  app.set('config', config);
  app.set('mongoose', mongoose);
  app.set('approot', path.dirname(require.main.filename));
  
	mongoose.connect(
		dataHelper.toConnectString(config.mongo.connection), 
		{ replset: { rs_name: config.mongo.setName } }
	);

  mongoose.connection.on('error', console.error.bind(console, 'Data connection error:'));
  mongoose.connection.once('open', function () {
    console.log('Data connection successful to '+util.inspect(config.mongo.connection));
  });
  
  // Dynamically load plugins, based on config.plugins hash 
  plugin.load(app, config.plugins);
  
  // Load local routes
  require('../routes/index')(app);
}

module.exports.init = init;