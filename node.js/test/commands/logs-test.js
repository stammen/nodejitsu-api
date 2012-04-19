var vows = require('vows'),
    assert = require('assert'),
    nock = require('nock'),
    makeApiCall = require('../macros').makeApiCall;

vows.describe('logs').addBatch(makeApiCall(
  'logs byApp myApp 50',
  function setup () {
    nock('http://api.mockjitsu.com')
      .post('/logs/tester/myApp', {
        from: "NOW-1DAY",
        until: "NOW",
        rows: "50"
      })
      .reply(200, {}, { 'x-powered-by': 'Nodejitsu' })
  }
)).addBatch(makeApiCall(
  'logs byUser myUser 50',
  function setup () {
    nock('http://api.mockjitsu.com')
      .post('/logs/myUser', {
        from: "NOW-1DAY",
        until: "NOW",
        rows: "50"
      })
      .reply(200, {}, { 'x-powered-by': 'Nodejitsu' })
  }
)).addBatch(makeApiCall(
  'logs streamByUser myUser',
  function setup () {
    nock('http://api.mockjitsu.com')
      .get('/logs/myUser/stream')
      .reply(200, {
          app: 'example-app',
          user: 'myUser',
          data: 'Testing my app.1334857998687\n',
          name: 'stdout'
      }, { 'x-powered-by': 'Nodejitsu' })
  }
)).export(module);