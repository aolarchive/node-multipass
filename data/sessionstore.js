var express = require('express')
	, MongoStore = require('connect-mongo')(express)
  , dataHelper = require('./helper')
  , config = require('../conf/config')
  , util = require('util')
  , _ = require('underscore')._;


var sessionStore = {
  
  db: null,
    
  config : {
    host: config.session.mongo.host || null,
    port: config.session.mongo.port || null,
    db: config.session.mongo.db || null,
    collection: config.session.mongo.collection || null,
    username: config.session.mongo.username || null,
    password: config.session.mongo.password || null,
    cookie: _.extend({ 
    	maxAge: 1000 * 60 * 5	// Use 5 min. TTL for login sessions 
    	}, config.session.cookie),
    key: config.session.key || null
  },
  
  init : function(app) {
    
    sessionStore.db.once('error', console.error.bind(console, 'SessionStore connection error:'));
    sessionStore.db.once('open', function(event){
      console.log('SessionStore connection successful to '+util.inspect(config.session.mongo.connection));
    });
    
    app.use(
      express.session(
        { 
          secret: config.session.secret,
          key: sessionStore.config.key,
          cookie: sessionStore.config.cookie,
          store: new MongoStore({
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
	config.session.mongo.connection, 
	{ 
		replset: { 
			rs_name: config.session.mongo.setName,
			readPreference: 'secondaryPreferred' 
		}
	}
);

module.exports = sessionStore;