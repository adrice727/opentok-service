'use strict';
// Config
const config = require('../config/config');
const apiKey = config.apiKey;
const apiSecret = config.apiSecret;


// Imports
const Promise = require('bluebird');
const R = require('ramda');
const OpenTok = require('opentok');
const OT = Promise.promisifyAll(new OpenTok(apiKey, apiSecret));

const defaultTokenOptions = {
  role: 'moderator',
  expireTime: (Date.now() / 1000) + (7 * 24 * 60 * 60), // in one week
};

const createSession = function*(options) {
  const session = yield OT.createSessionAsync(options);
  yield session;
};

const getSession = function* () {
  const options = R.path(['request', 'body'], this);
  this.body = yield OT.createSessionAsync(options);
};

const getToken = function* () {
  const sessionId = this.request.body.sessionId;
  const tokenOptions = R.merge(defaultTokenOptions, R.path(['request', 'body', 'options'], this));
  this.body = OT.generateToken(sessionId, tokenOptions);
};

module.exports = {
  createSession,
  getSession,
  getToken,
};
