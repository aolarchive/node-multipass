var Db = require('mongodb').Db
  , Server = require('mongodb').Server
  , mongoStore = require('connect-mongodb')
  , config = require('../conf/config');


var serverConfig = new Server(
  config.session.host,
  config.session.port,
  {
    auto_reconnect: true,
    native_parser: true
  }
);
var db = new Db(config.session.db, serverConfig, { safe:false });

exports.get = function() {
  var store = new mongoStore({db: db});
  return store;
};
