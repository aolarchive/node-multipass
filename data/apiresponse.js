var util = require('util');


var ApiResponse = function(err, data, httpStatus, message) {

	this.error = err;
	this.data = data;
	this.httpStatus = httpStatus;
	this.message = message || '';
};

ApiResponse.prototype.getError = function() {
  return this.error;
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
