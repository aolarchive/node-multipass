var mongoStore = require('connect-mongodb')
  , dataHelper = require('./helper')
  , config = require('../conf/config')
  , express = require('express')
  , util = require('util');


var sessionStore = {
  
  db: null,
    
  config : {
    host: config.session.host || null,
    port: config.session.port || null,
    db: config.session.db || null,
    collection: config.session.collection || null,
    username: config.session.username || null,
    password: config.session.password || null,
    cookie: config.session.cookie || null,
    key: config.session.key || null
  },
  
  init : function(app) {
    
    sessionStore.db.once('error', function(event){
      console.log('SessionStore connection error: ['+event.toString()+']');
    });
    sessionStore.db.once('open', function(event){
      console.log('SessionStore connection successful to '+util.inspect(config.session.connection));
    });
    
    app.use(
      express.session(
        { 
          secret: config.session.secret,
          key: sessionStore.config.key,
          cookie: sessionStore.config.cookie,
          store: new mongoStore({
            db: sessionStore.db,
            collection : sessionStore.config.collection,
            username: sessionStore.config.username,
            password: sessionStore.config.password
          })
        }
      )
    );
  }
  
};

// Create initial Db instance
sessionStore.db = dataHelper.getDb(
	config.session.connection, 
	{ replset: { rs_name: config.session.setName } }
);

module.exports = sessionStore;