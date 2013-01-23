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
        //JJ Test App: https://developer.apps.yahoo.com/projects/dKoQ6x4k
        yahoo: {
          consumerKey: "dj0yJmk9cW95cDhQWG9uTUhEJmQ9WVdrOVpFdHZVVFo0TkdzbWNHbzlOelE1TWprNU5UWXkmcz1jb25zdW1lcnNlY3JldCZ4PThl",
          consumerSecret: "5e95e0b09390095a9fb243cc570de39521a1e562"
        },
        //JJ Test App: https://github.com/settings/applications/28082
        github: {
          clientId : "61f5263989c63542b6e7",
          clientSecret : "78bfbc0552f62a424fb6f245040c3f80b6add763"
        },
        //JJ Test App: https://www.dropbox.com/developers/app_info/119959
        dropbox: {
          consumerKey: "vdon89t4whsq7x9",
          consumerSecret: "b6jkyap4a0r6f6m"
        },
        //JJ Test App: http://www.tumblr.com/oauth/apps
        tumblr: {
          consumerKey: "afaLCAqqi5ITZVlB0Qb2R82h3lsxxlkmol7jfdMncqcC9dN6Xn",
          consumerSecret: "Cq8BA2OzVbVowyHGQNFDEAsSUacrM32gXwhkBDPe9ZuUoduQck"
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
