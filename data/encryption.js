/**
 * Mongoose plugin for encrypting specified fields in a schema.
 * 
 * Inspired from mongoose-troop/obfuscate:
 * https://github.com/tblobaum/mongoose-troop/blob/master/lib/obfuscate.js
 */
var crypto = require('crypto');


//Plugin
function encryption (schema, options) {
  options = options || {};

  // Options
  var fields = options.fields || []                     // Array of fields to encrypt
    , algorithm = options.algorithm || 'aes-256-cbc'    // Encryption algorithm
    , key = options.key || 'secret'                     // Encryption key
    , input = options.input || 'utf8'                   // Original encoding
    , output = options.output || 'hex';                 // Conversion encoding

  // If fields is a string, make it an Array element
  if (typeof fields == 'string') {
    fields = [fields];
  }
  
  // Encrypt a string with the options provided
  function encrypt (str) {
    var cipher = crypto.createCipher(algorithm, key)
      , crypted = cipher.update(str, input, output) + cipher.final(output);
    return crypted;
  }

  // Decrypt an encrypted string
  function decrypt (str) {
    var decipher = crypto.createDecipher(algorithm, key)
      , dec = decipher.update(str, output, input) + decipher.final(input);
    return dec;
  }

  // Decrypt fields after init, when document has been populated from db
  schema.post('init', function () {
    var doc = this;
    fields.forEach(function(field){
      if (doc.get(field)) {
        doc.set(field, decrypt(doc.get(field)));
      }
    });
    return doc;
  });
  
  // Encrypt fields before save
  schema.pre('save', function (next) {
    var doc = this;
    fields.forEach(function(field){
      if (doc.get(field)) {
        doc.set(field, encrypt(doc.get(field)));
      }
    });
    next();
  });

  // Add encryption methods to both instance and model
  ['method', 'static'].forEach(function(method) {
    schema[method]({
      encrypt: encrypt,
      decrypt: decrypt
    })
  });

};

module.exports = encryption;
