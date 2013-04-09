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
    		// The path to the plugin init code
    		init: 'plugin.js'
    	}
    },
    */
    
    /**
     * Mongo session store properties
     */
    session: {
    	/*
    	key: '',  // The optional session cookie key name; defaults to connect.sid
    	cookie: {},  // The optional session cookie properties, based on express.session.cookie object
    	collection: '', // The optional db collection name; defaults to 'sessions'
    	*/
      secret: 'Leeloo Minai Lekarariba-Lamina-Tchai Ekbat De Sebat', // Or, Leeloo, for short :)
      connection : "mongodb://localhost:27017/multipass_session"
    },
    
    /**
     * Mongo data properties 
     */
    mongo: {
      secret: 'Jean-Baptiste Emanuel Zorg',
      connection : "mongodb://localhost:27017/multipass"
    }
};

module.exports = config;
