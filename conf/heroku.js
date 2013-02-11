var config = {
    server: {
      port: process.env.PORT || 3000
    },
    proxy: {
      port: 443,
      host: 'multipass.herokuapp.com',
      https: true
    },
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
        },
        //JJ Test App: https://developer.apps.yahoo.com/projects/4xFuZk3c
        yahoo: {
          consumerKey: "dj0yJmk9MERXamdhWmFtbmFWJmQ9WVdrOU5IaEdkVnByTTJNbWNHbzlNVEUyTlRNeE1EWXkmcz1jb25zdW1lcnNlY3JldCZ4PTgy",
          consumerSecret: "5a4e2ff74c754a6eed736f3e55b8e8f2f41f1bac"
        },
        //JJ Test App: https://github.com/settings/applications/34966
        github: {
          clientId : "36bf9e63b170a5068349",
          clientSecret : "d94c944c40629f906d1d211926a7d32be0b8c53a"
        },
        //JJ Test App: https://www.dropbox.com/developers/app_info/119959
        dropbox: {
          consumerKey: "vdon89t4whsq7x9",
          consumerSecret: "b6jkyap4a0r6f6m"
        },
        //JJ Test App: http://www.tumblr.com/oauth/apps
        tumblr: {
          consumerKey: "XCLbMJlflgBETUjt3WnEXaXAqu0LRqIiHqa9I1EA3XVhd1k6Q8",
          consumerSecret: "Oa1q7wwJWRpQo2EfWTMTckRLIzebUdIhDA1qHqbEZbFCyjkesO"
        }
    },
    session: {
      secret: 'Leeloo Minai Lekarariba-Lamina-Tchai Ekbat De Sebat', // Or, Leeloo, for short :)
      connection: process.env.MONGOLAB_URI || "mongodb://localhost:27017/multipass_session"
    },
    mongo: {
      secret: 'Jean-Baptiste Emanuel Zorg',
      connection : process.env.MONGOLAB_URI || "mongodb://localhost:27017/multipass_dev",
      collection : 'users'
    }
};

module.exports = config;
