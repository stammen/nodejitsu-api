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
// ### function _logger (appName, amount, callback)
// Lazily load winston logger.
//
Logs.prototype._logger = function () {
  if (this.__logger) return this.__logger;

  var winston = require('winston'),
      url = require('url');

  var logger = new winston.Logger;
  var uri = url.parse(this.options.get('logServer'));

  logger.add(winston.transports.Http, {
    ssl: uri.protocol === 'https:',
    host: uri.host,
    port: uri.port
  });

  return this.__logger = logger;
};

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
        rows: amount,
        path: argv.join('/')
      };

  return this._logger().query(options, function (err, results) {
    if (err) return callback(err);
    return callback(null, results.http.redis);
  });
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
    rows: amount,
    path: ['query', username].join('/')
  };

  return this._logger().query(options, function (err, results) {
    if (err) return callback(err);
    return callback(null, results.http.redis);
  });
};

//
// ### function streamByUser (amount, callback)
// #### @username {string} Name of user whose logs we wish to retrieve
// #### @amount {number} the number of lines to retrieve
// #### @callback {function} Continuation to pass control to when complete.
// Retrieves logs for all the applications for the user.
//
Logs.prototype.streamByUser = function (username, options, callback) {
  if (!callback) {
    callback = options;
    options = null;
  }

  if (!callback) {
    callback = username;
    username = null;
  }

  if (username == null) {
    username = this.options.get('username');
  }

  options = options || { start: -1 };

  options.path = ['stream', username].join('/');

  return this._logger().stream(options);
};

//
// ### function streamByApp (amount, callback)
// #### @username {string} Name of user whose logs we wish to retrieve
// #### @amount {number} the number of lines to retrieve
// #### @callback {function} Continuation to pass control to when complete.
// Retrieves streaming logs for a user's application.
//
Logs.prototype.streamByApp = function (appName, options, callback) {
  if (!callback) {
    callback = options;
    options = null;
  }

  var appName = defaultUser.call(this, appName),
      argv = ['stream'].concat(appName.split('/'));

  options = options || { start: -1 };
  options.path = argv.join('/');

  return this._logger().stream(options);
};
