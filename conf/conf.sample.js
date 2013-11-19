var config = {
    /**
     * Node server properties
     */
    server: {
      port: process.env.PORT || 3000
    },
    
    /**
     * Proxy server properties; optional.
     */
    /*
    proxy: {
      port: 443,
      host: 'localhost',
      https: true
    },
    */
   
		/**
		 * Cluster properties 
		 */
		/*
		cluster: {
			enabled: false,
			workers: 1
		},
		*/
		
    /**
     * URL paths
     */
    paths: { 
      api: '/api',
      authRedirect: '/',
      failRedirect: '/'
    },
    
    /**
     * Logging properties
     */
    /*
    logging: {
    	// Options for generating access log
    	access: { 
    		file: './logs/access.log',	// Path to access log
    		format: 'default'						// Token defining the output format; 
    																//  accepts any value for express.logger, in addition to ('combined'|'argus')
    	}
    },
    */
    
    /**
     * Auth providers
     */
    providers: {
      /*
       * Add configuration for each auth strategy here.
       * There may only be one config object per strategy.
       * 
       * Different auth strategies use different config properties, 
       * 'appId' vs. 'consumerKey' for instance, so consult their documention 
       * for which properties to use.
       * 
       * @see https://github.com/jaredhanson/passport#strategies-1
       * 
       * Example:
       * 
       * facebook: {
       *   appId: "123-456-789",
       *   appSecret: "abcd-efgh-ijkl-mnop-qrst-uvwx-yz"
       * }
       * 
       */
    },
    
    /**
     * Map of plugins to load into the app, in the form of config objects.
     */
    /*
    plugins: {
    	// The object key is the plugin name
    	myPlugin: {
    		init: 'plugin.js', 	// Path to plugin init file, passed directly into require()
    		options: {} 				// Optional static options to pass into the plugin's init() function
    	}
    },
    */
    
    /**
     * Session store properties
     */
    session: {
    	/*
    	key: '', 		// The optional session cookie key name; defaults to connect.sid
    	cookie: {},	// The optional session cookie properties, based on express.session.cookie object
    	*/
      secret: 'Leeloo Minai Lekarariba-Lamina-Tchai Ekbat De Sebat', // Or, Leeloo, for short :)
      
      /*
       * The session MongoDB connection properties
       */
      mongo: {
      	connection: "mongodb://localhost:27017/multipass_session"
      	/*
      	// Alternate connection format when defining replica sets
	      connection:	[	
	      	"mongodb://host1:27017/multipass",
	      	"mongodb://host2:27017",
	      	"mongodb://host3:27017"
	      ],
	      
    		collection: '',	// The optional db collection name; defaults to 'sessions'
      	setName: '',		// The Mongo replica set name
      	username: '',		// The Mongo username; auths against db defined in 'connection'
      	password: ''		// The Mongo password
      	*/
      }
    },
    
    /**
     * Data properties 
     */
    data: {
      secret: 'Jean-Baptiste Emanuel Zorg',
      
      /*
       * The data MongoDB connection properties
       */
      mongo: {
	      connection: "mongodb://localhost:27017/multipass"
	      /*
	      // Alternate connection format when defining replica sets
	      connection:	[	
	      	"mongodb://host1:27017/multipass",
	      	"mongodb://host2:27017",
	      	"mongodb://host3:27017"
	      ],
	      
    		collection: '',	// The optional db collection name; defaults to 'users'
      	setName: '',		// The Mongo replica set name
      	username: '',		// The Mongo username; auths against db defined in 'connection'
      	password: ''		// The Mongo password
      	*/
      }
    }
};

module.exports = config;
