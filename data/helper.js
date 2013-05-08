var Db = require('mongodb').Db
  , Server = require('mongodb').Server
  , ReplSet = require('mongodb').ReplSet
  , url = require('url')
  , _ = require('underscore')._
  , util = require('util');


var dataHelper = {
	
	/**
	 * Return a Mongo Db object from a given connection string.
	 * 
	 * @param {mixed} connection A connection string, or array of strings in case of replica set.
	 * @param {Object} options The options to pass into connection.
	 * 
	 * Format:
	 * <pre>
	 * options: {
	 *   db: {},
	 * 	 server: {},
	 * 	 replset: {},
	 * 	 user: '',
	 * 	 pass: '',
	 * 	 auth: {}
	 * }
	 * </pre>
	 * 
	 * @see http://mongoosejs.com/docs/api.html#connection_Connection-open
	 * 
	 * @returns {Object} The Db object 
	 */
	getDb: function (connection, options) {
		var serverConfig,
			dbOptions = options && options.db;
		
    if (util.isArray(connection)) {
    	serverConfig = dataHelper.getReplSetConfig(connection, options);
    } else {
    	serverConfig = dataHelper.getServerConfig(connection, options);
    }

    return (new Db(serverConfig.db, serverConfig.server, _.extend({ safe:false }, dbOptions)));
 	},
 
	/**
	 * Return a config object with connection properties, for one connection.
	 * 
	 * @param {Object} connectString The connection string to use
	 * @param {Object} options Options to pass into Server object
	 * 
	 * @returns {Object} The config object, where 'server' property is the Server instance
	 */
	getServerConfig: function (connectString, options) {
		var serverConfig = null;
		
		if (connectString && typeof connectString == 'string') {
			var serverOptions = options && options.server,
				urlObj = url.parse(connectString),
        urlAuth = urlObj.auth ? urlObj.auth.split(':') : null,
        
	      serverConfig = {
	        host: urlObj.hostname,
	        port: urlObj.port,
	        db: (urlObj.pathname && String(urlObj.pathname).substr(1)) || null,
	        username: (urlAuth && urlAuth[0]) || null,
	        password: (urlAuth && urlAuth[1]) || null,
	        server: null
	      };
	      
      serverConfig.server = new Server(
	      serverConfig.host,
	      Number(serverConfig.port),
	      _.extend({
		        auto_reconnect: true,
		        native_parser: true
				  },
				  serverOptions
		    )
	    );
		}	
		
		return serverConfig;
	},

	/**
	 * Return a config object, for a set of connections in a replica set. 
	 * 
	 * @param {Object} connections Array of connection strings
	 * @param {Object} options Options to pass into ReplSet object
	 * 
	 * @returns {Object} The config object, where 'server' property is the ReplSet instance
	 */
	getReplSetConfig: function (connections, options) {
		var servers = [],
			serverConfig,
			replSetConfig = null,
			replSetOptions = options && options.replset,
			servers = [],
			db = null;
		
		if (util.isArray(connections)) {	
			connections.forEach(function (connection, i) {
				serverConfig = dataHelper.getServerConfig(connection, options);
				if (serverConfig) {
					db = serverConfig.db || db;
					servers.push(serverConfig.server);
				}
			});
		}
		
		if (servers.length) {
			replSetConfig = {
				server: new ReplSet(servers, replSetOptions),
				db: db
			}
		}
		
		return replSetConfig;
	},
	
	/**
	 * Convert the given object into a valid connection string.
	 * 
	 * @param {Object} connection The object, Array, or string to convert into a connection string
	 * 
	 * @returns {String} The connection string
	 */
	toConnectString: function (connection) {
		var connString = connection;
		
		if (util.isArray(connection)) {
			connString = connection.join(',');
		}
		
		return connString;
	}
	  
};

module.exports = dataHelper;