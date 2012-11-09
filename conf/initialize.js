var config = require('./config'),
	mongoose = require('mongoose');

function init(app) {

	mongoose.connect(config.mongo.data.connection);
	
	mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
	mongoose.connection.once('open', function () {
		console.log('Connection successful to '+config.mongo.data.connection);
	});

}

module.exports = init;