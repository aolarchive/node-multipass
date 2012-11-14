var config = {
    port: 3000,
    paths: { 
      base: 'http://devlocal.aol.com:3000',
      api: '/api',
      logout: '/logout',
      authRedirect: '/',
      failRedirect: '/'
    },
    providers: {
        //JJ Test App: https://developers.facebook.com/apps/105846932813376
        facebook: {
          appId: "105846932813376",
          appSecret: "117ddf4b3a250c722dcaeb51f39d1139"
        },
        //JJ Test App: https://dev.twitter.com/apps/3609768
        twitter: {
          consumerKey: "Kp2QGreXSz1qFoBic578g",
          consumerSecret: "fMwIyP0z2NZNBzuX4m0qnav1zr5HJyQSI6r5saeaebA"
        },
        //JJ Test App: https://developer.linkedin.com/
        linkedin: {
          consumerKey: "eoirk2elkeeg",
          consumerSecret: "Pwqxvz4vjiZ3MBUH"
        },
        aol: {
          clientId : "ao1iDZvZUadYKQfY",
          clientSecret : "s6a8aPuspUM3dEYa"
        }
    },
    session: {
      secret: 'Leeloo Minai Lekarariba-Lamina-Tchai Ekbat De Sebat' // Or, Leeloo, for short :)
    },
    mongo: {
      connection : "mongodb://localhost:27017/multipass_dev",
      collection : 'users'
    }
};

module.exports = config;
