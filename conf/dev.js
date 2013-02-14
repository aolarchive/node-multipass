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
     * Mongo session store properties
     */
    session: {
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
