var config = {
    port: 3000,
    baseUrl: 'http://devlocal.aol.com:3000',
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
        }
    },
    mongo: {
      data : {
        connection : "mongodb://localhost:27017/multipass_dev"
      },
      session : {
          host : "localhost",
          port : 27017,
          db : "Multipass"
      }
    }
};

module.exports = config;
