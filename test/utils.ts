/* eslint-disable no-console */
/* eslint-disable no-undef */
import supertest from 'supertest';
import util from 'util';
import { assert, expect } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
import { getNextWeekday } from '../scripts/utils';
import { sailsVegi } from '../api/interfaces/iSails';
declare var sails: sailsVegi;

export const loginAsUser = async function (name, secret, verbose = false) {
  try {
    if (verbose) {
      console.log(`Login with ${name}'s Account`);
    }

    return supertest(sails.hooks.http.app)
      .post('/api/v1/admin/login-with-secret')
      .send({
        name: name,
        secret: secret,
      })
      .expect(200)
      .then((response) => {
        return response;
      })
      .catch((errs) => {
        console.warn(errs);
        throw errs;
      });
  } catch (loginErr) {
    console.warn(
      'test/utils.js: Lifecycle.test failed to login with test service account: ' +
        loginErr
    );
    return loginErr;
  }
};

export const login = async function (verbose = false) {
  assert.containsAllKeys(
    sails.config.custom,
    [
      'test_TEST_SERVICE_secret',
      'test_TEST_USER_secret',
      'test_TEST_VENDOR_secret',
      'test_TEST_DELIVERY_PARTNER_secret',
      'FIREBASE_AUTH_EMULATOR_HOST',
    ],
    '.env config does not contain secrets for testing: ' +
      util.inspect(sails.config.custom, { depth: 1 })
  );
  return await loginAsUser(
    'TEST_SERVICE',
    sails.config.custom.test_TEST_SERVICE_secret,
    verbose
  );
};

export const logout = async function (verbose = false) {
  try {
    if (verbose) {
      console.log('Logout with Test Account');
    }

    return supertest(sails.hooks.http.app)
      .get('/api/v1/admin/logout')
      .expect(200)
      .then((response) => {
        // must be then, not a callback
        assert(response.body.data !== undefined);
        return response;
      })
      .catch((err) => {
        assert(err === undefined);
        throw err;
      });
  } catch (logoutErr) {
    console.warn(
      'test/utils.js: Lifecycle.test failed to logout with test service account: ' +
        logoutErr
    );
    throw logoutErr;
  }
};

export const logoutCbLogin = async (cb, verbose = false) =>
  logout(verbose)
    .then(() => cb())
    .then((unused) => login(verbose));

export const callAuthActionWithCookie = async (cb, verbose = false, data = {}) =>
  login(verbose).then((response) => {
    expect(response.statusCode).to.equal(
      200,
      'Login-with-secret wrapper failed to login: ' +
        util.inspect(response, { depth: null })
    );
    expect(Object.keys(response.headers)).to.deep.include('set-cookie');
    const sessionCookie = response.headers['set-cookie'];
    if (verbose) {
      console.log('SESSION COOKIE: "' + sessionCookie + '"');
    }
    return cb(sessionCookie);
  });

export const callAuthActionWithCookieAndUser = async (
  cb,
  name,
  secret,
  verbose = false,
  data = {}
) =>
  loginAsUser(name, secret, verbose).then((response) => {
    expect(response.statusCode).to.equal(
      200,
      'Login-with-secret wrapper failed to login: ' +
        util.inspect(response, { depth: null })
    );
    expect(Object.keys(response.headers)).to.deep.include('set-cookie');
    const sessionCookie = response.headers['set-cookie'];
    if (verbose) {
      console.log('SESSION COOKIE: "' + sessionCookie + '"');
    }
    return cb(sessionCookie);
  });
