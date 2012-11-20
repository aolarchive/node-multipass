var config = {
    port: process.env.PORT || 3000,
    host: 'multipass.herokuapp.com',
    portPublic: 80,
    paths: { 
      api: '/api',
      logout: '/logout',
      authRedirect: '/',
      failRedirect: '/'
    },
    providers: {
        //JJ Test App: https://developers.facebook.com/apps/307415842706720
        facebook: {
          appId: "307415842706720",
          appSecret: "397f97341adbc9020c880f0a99d4d700"
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
        //JJ Test App: https://manage.dev.live.com/Applications/Summary/000000004C0DA46F
        windowslive : {
          clientId: "000000004C0DA46F",
          clientSecret: "Z-vvfxIft8XU1qMaDDjFnuekTYjl3VXZ"
        },
        //JJ Test App: https://code.google.com/apis/console
        google : {
          clientId : "85151977732.apps.googleusercontent.com",
          clientSecret : "iSpCrv9Cv4ACxgkInJ22ebfs"
        },
        aol: {
          clientId : "ao1iDZvZUadYKQfY",
          clientSecret : "s6a8aPuspUM3dEYa"
        }
    },
    session: {
      secret: 'Leeloo Minai Lekarariba-Lamina-Tchai Ekbat De Sebat', // Or, Leeloo, for short :)
      connection: process.env.MONGOLAB_URI || "mongodb://localhost:27017/multipass_session"
    },
    mongo: {
      connection : process.env.MONGOLAB_URI || "mongodb://localhost:27017/multipass_dev",
      collection : 'users'
    }
};

module.exports = config;
