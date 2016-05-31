'use strict';
/* eslint-disable no-underscore-dangle */

/** Config */
const config = require('../config/config');
const balance = process.env.BALANCE || config.balance;
const admin = process.env.ADMIN || config.admin;

/** Imports */
const Promise = require('bluebird');
const R = require('ramda');
const async = Promise.coroutine;
const db = require('monk')(process.env.MONGODB_URI || config.mongo);
const whitelist = db.get('whitelist');

/** Private Methods */
const parseDomain = ctx => {
  let domain = R.path(['request', 'host'], ctx);

  if (!domain) {
    const origin = R.path(['request', 'origin'], ctx);
    if (origin) {
      domain = R.last(origin.split('://'));
    }
  }

  return domain;
};

const getAdmin = R.path(['request', 'body', 'admin']);
const getDomain = R.path(['request', 'body', 'domain']);
const getPh = R.path(['request', 'body', 'ph']);

const isAuthorizedLocalDomain = (domain, ph) => {
  const isLocal = domain.slice(0, 9) === 'localhost';
  const isBalanced = ph === balance;
  return (isLocal && isBalanced);
};

/** Exported Methods */

// Admin
const isAdmin = function* (next) {
  if (!getAdmin(this) === admin) {
    this.throw(403, 'You are not authorized');
  }
  yield next;
};

// Whitelist a domain
const registerDomain = async(function* () {
  const domain = getDomain(this);
  if (R.isEmpty(domain)) {
    this.throw(400, 'No domain provided in request');
  } else {
    let record = yield whitelist.find({ domain });
    if (R.isEmpty(record)) {
      record = yield whitelist.insert({ domain });
    }
    this.body = `${domain} is now a registered domain`;
  }
});

// Is the domain whitelisted or a local server with valid credentials?
const validDomain = function* (next) {
  const domain = parseDomain(this);
  const ph = getPh(this);

  if (R.isEmpty(domain)) {
    this.throw(403, 'Unable to validate your domain');
  } else if (isAuthorizedLocalDomain(domain, ph)) {
    yield next;
  } else {
    const record = yield whitelist.find({ domain });
    if (R.isEmpty(record)) {
      this.throw(403, 'This domain is not authorized');
    }
  }
};

module.exports = {
  isAdmin,
  registerDomain,
  validDomain,
};
