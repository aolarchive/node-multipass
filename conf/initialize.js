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
		dataHelper.toConnectString(config.data.mongo.connection), 
		{ 
			replset: { 
				rs_name: config.data.mongo.setName,
				readPreference: 'secondaryPreferred' 
			},
			user: config.data.mongo.username,
			pass: config.data.mongo.password
		}
	);

  mongoose.connection.on('error', console.error.bind(console, 'Data connection error:'));
  mongoose.connection.once('open', function () {
    console.log('Data connection successful to '+util.inspect(config.data.mongo.connection));
  });
  
  // Dynamically load plugins, based on config.plugins hash 
  plugin.load(app, config.plugins);
  
  // Load local routes
  require('../routes/index')(app);
}

module.exports.init = init;