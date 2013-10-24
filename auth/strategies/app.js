var passport = require('passport')
  , util = require('util');


function AppStrategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('App strategy requires a verify function');
  
  passport.Strategy.call(this);
  this.name = 'app';
  this._verify = verify;
  this._realm = options.realm || 'App';
  this._passReqToCallback = options.passReqToCallback;
  this._requireUserId = options.requireUserId;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(AppStrategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a HTTP Basic authorization
 * header.
 *
 * @param {Object} req
 * @api protected
 */
AppStrategy.prototype.authenticate = function(req) {
  var self = this, appId, appSecret, userId;
  
  if (!req.auth) {
    return this.fail(this._challenge());
    
  } else {
    appId = req.auth.username;
    appSecret = req.auth.password;
    userId = req.params.userId || req.get('x-multipass-user') || null;
    
    if (!appId || !appSecret) {
      return this.fail(400);
      
    } else {
      function verified (err, user) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(self._challenge()); }
        self.success(user);
      }
      
      if (this._passReqToCallback) {
        this._verify(req, appId, appSecret, userId, verified);
      } else {
        this._verify(appId, appSecret, userId, verified);
      }
    }
  }
};

/**
 * Authentication challenge.
 *
 * @api private
 */
AppStrategy.prototype._challenge = function() {
  return '';//'Basic realm="' + this._realm + '"';
}

/**
 * Expose `AppStrategy`.
 */ 
module.exports = AppStrategy;