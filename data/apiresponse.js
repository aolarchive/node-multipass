var util = require('util');


/**
 * Object storing a response state, used by HttpHelper to send actual HTTP response.
 * If data is an Error object, represents an error state, and isError() will return true.
 * 
 * Usage:
 *   ApiResponse({})                                  // 200, with data
 *   ApiResponse(200, {})                             // Same as above
 *   ApiResponse(Error('There was a problem'))        // 500, with Error
 *   ApiResponse(400, Error('Invalid input'))         // 400, with Error  
 *   ApiResponse(401, err, 'You are not authorized')  // 401, passing in Error object, overriding message
 */
var ApiResponse = function(httpStatus, data, message) {

  this.httpStatus = null;
  this.data = null;
  this.message = null;
  
  if (typeof(httpStatus) == 'number') {
    this.httpStatus = httpStatus;
    this.data = data;
    this.message = message || (data && data.message);
  } else if (httpStatus instanceof Error) {
    this.httpStatus = 500;
    this.data = httpStatus;
    this.message = data || (httpStatus && httpStatus.message);
  } else {
    this.httpStatus = 200;
    this.data = httpStatus;
    this.message = data || (httpStatus && httpStatus.message)
  }
};

ApiResponse.prototype.isError = function() {
  return util.isError(this.data);
};

ApiResponse.prototype.getData = function() {
	return this.data;
};

ApiResponse.prototype.getHTTPStatus = function() {
	return this.httpStatus;
};

ApiResponse.prototype.getLastModifiedDate = function() {
    var modDate = null;
    if (this.data) {
        if (util.isArray(this.data)) {
            
        } else if (this.data.getLastModifiedDate) {
            modDate = this.data.getLastModifiedDate();
        }

        if (modDate) {
            modDate = modDate.toGMTString();
        }
    }
    return modDate;
};

ApiResponse.prototype.getETag = function() {
    var etag = null;
    if (this.data) {
        if (util.isArray(this.data)) {
            
        } else if (this.data.getETag) {
            etag = this.data.getETag();
        }
    }
    return etag;
};

module.exports = ApiResponse;
