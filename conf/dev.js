var config = {
    server: {
      port: process.env.PORT || 3000
    },
    proxy: {
      port: 3443,
      host: 'devlocal.aol.com',
      https: true
    },
    paths: { 
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
        //JJ Test App: https://manage.dev.live.com/Applications/Summary/4c0d972e
        windowslive : {
          clientId: "000000004C0D972E",
          clientSecret: "4zeL16XsSVSwF6GjBqKYtdYXcEuGsRJi"
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
        //JJ Test App: http://developer.apps.yahoo.com/projects/CpvuiS7i
        yahoo: {
          consumerKey: "dj0yJmk9OXNrRkxmTUtUOVdTJmQ9WVdrOVEzQjJkV2xUTjJrbWNHbzlNVEV3TmpneU1qUTJNZy0tJnM9Y29uc3VtZXJzZWNyZXQmeD02Ng--",
          consumerSecret: "4dad7ccde5ccc7223f704d34e8acca8778bac6d0"
        },
        //JJ Test App: https://github.com/settings/applications/28082
        github: {
          clientId : "e2a289e2bdf370f8e9c5",
          clientSecret : "63623224a31a43c4c5c33bcc7e5eeb212eb3f4b4"
        },
        //JJ Test App: https://www.dropbox.com/developers/app_info/119959
        dropbox: {
          consumerKey: "vdon89t4whsq7x9",
          consumerSecret: "b6jkyap4a0r6f6m"
        }
    },
    session: {
      secret: 'Leeloo Minai Lekarariba-Lamina-Tchai Ekbat De Sebat', // Or, Leeloo, for short :)
      connection : "mongodb://localhost:27017/multipass_session"
    },
    mongo: {
      secret: 'Jean-Baptiste Emanuel Zorg',
      connection : "mongodb://localhost:27017/multipass_dev",
      collection : 'users'
    }
};

module.exports = config;
