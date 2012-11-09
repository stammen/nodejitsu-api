/*
 * logs.js: Client for the Nodejitsu logs API.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var util = require('util'),
    Client = require('./client').Client,
    defaultUser = require('./helpers').defaultUser;

//
// ### function Logs (options)
// #### @options {Object} Options for this instance
// Constructor function for the Logs resource
// with Nodejitsu's Logs API
//
var Logs = exports.Logs = function (options) {
  Client.call(this, options);
};

// Inherit from Client base object
util.inherits(Logs, Client);

//
// ### function byApp (appName, amount, callback)
// #### @appName {string} Name of the application to retrieve
// #### @amount {number} the number of lines to retrieve
// #### @callback {function} Continuation to pass control to when complete.
// It retrieves the specified amount of logs for the application
//
Logs.prototype.byApp = function (appName, amount, callback) {
  var appName = defaultUser.call(this, appName),
      argv = ['query'].concat(appName.split('/')),
      options = {
        from: Date.now() - 24 * 60 * 60 * 1000,
        until: Date.now(),
        rows: amount
      };

  this.request('POST', argv, options, callback, function (res, result) {
    callback(null, result.redis || result);
  }, 'log');
};

//
// ### function byUser (amount, callback)
// #### @username {string} Name of user whose logs we wish to retrieve
// #### @amount {number} the number of lines to retrieve
// #### @callback {function} Continuation to pass control to when complete.
// It retrieves the specified amount of logs for all the applications for the user
//
Logs.prototype.byUser = function (username, amount, callback) {
  var options;

  if (arguments.length == 2) {
    callback = amount;
    amount = username;
    username = this.options.get('username');
  }

  if (username == null) {
    username = this.options.get('username');
  }

  options = {
    from: Date.now() - 24 * 60 * 60 * 1000,
    until: Date.now(),
    rows: amount
  };

  this.request('POST', ['query', username], options, callback, function (res, result) {
    callback(null, result.redis || result);
  }, 'log');
};

//
// ### function streamByUser (amount, callback)
// #### @username {string} Name of user whose logs we wish to retrieve
// #### @amount {number} the number of lines to retrieve
// #### @callback {function} Continuation to pass control to when complete.
// Retrieves logs for all the applications for the user.
//
Logs.prototype.streamByUser = function (username, options) {
  if (username && typeof username === 'object') {
    options = username;
    username = null;
  }

  if (username == null) {
    username = this.options.get('username');
  }

  options = options || { start: -1 };

  return this.stream('POST', ['stream', username], options);
};

//
// ### function streamByApp (amount, callback)
// #### @username {string} Name of user whose logs we wish to retrieve
// #### @amount {number} the number of lines to retrieve
// #### @callback {function} Continuation to pass control to when complete.
// Retrieves streaming logs for a user's application.
//
Logs.prototype.streamByApp = function (appName, options) {
  var appName = defaultUser.call(this, appName),
      argv = ['stream'].concat(appName.split('/'));

  options = options || { start: -1 };

  return this.stream('POST', argv, options);
};
