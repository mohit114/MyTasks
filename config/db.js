'use strict'
var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connectToServer: function(callback) {
      MongoClient.connect("mongodb://maharjan:testpassword@ds147799.mlab.com:47799/application_users", function(err, db){
      _db = db;
      return callback(err);
    });
  },

  getDb: function() {
    return _db;
  }
};
