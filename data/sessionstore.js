var Db = require('mongodb').Db
  , Server = require('mongodb').Server
  , mongoStore = require('connect-mongodb')
  , config = require('../conf/config')
  , url = require('url')
  , express = require('express');


var sessionStore = {
  
  db: null,
    
  config : {
    host: config.session.host || null,
    port: config.session.port || null,
    db: config.session.db || null,
    username: config.session.username || null,
    password: config.session.password || null
  },
  
  init : function(app) {
    
    sessionStore.db.once('error', function(event){
      console.log('SessionStore connection error: ['+event.toString()+']');
    });
    sessionStore.db.once('open', function(event){
      console.log('SessionStore connection successful to mongodb://'+sessionStore.config.host+':'+sessionStore.config.port+'/'+sessionStore.config.db);
    });
    
    app.use(
      express.session(
        { 
          secret: config.session.secret,
          store: new mongoStore({
            db: sessionStore.db,
            username: sessionStore.config.username,
            password: sessionStore.config.password
          })
        }
      )
    );
  },
  
  getDb : function() {
    if (config.session.connection) {
      var urlObj = url.parse(config.session.connection),
        urlAuth = urlObj.auth ? urlObj.auth.split(':') : null;
        
      sessionStore.config = {
        host: urlObj.hostname,
        port: urlObj.port,
        db: String(urlObj.pathname).substr(1),
        username: (urlAuth && urlAuth[0]) || null,
        password: (urlAuth && urlAuth[1]) || null,
      };
    }

    var serverConfig = new Server(
      sessionStore.config.host,
      Number(sessionStore.config.port),
      {
        auto_reconnect: true,
        native_parser: true
      }
    );

    return (new Db(sessionStore.config.db, serverConfig, { safe:false }));
  }
};

// Create initial Db instance
sessionStore.db = sessionStore.getDb();

module.exports = sessionStore;