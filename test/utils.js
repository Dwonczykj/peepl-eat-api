/* eslint-disable no-console */
/* eslint-disable no-undef */
const { expect } = require("chai");
const request = require('supertest');
const dotenv = require('dotenv');
const envConfig = dotenv.config('./env').parsed;

const login = async function (verbose=false) {
  try {
    if(verbose){
      console.log('Login with Test Account');
    }

    return request(sails.hooks.http.app)
      .post("/api/v1/admin/login-with-secret")
      .send({
        name: "TEST_SERVICE",
        secret: envConfig["test_secret"],
      })
      .expect(200)
      .then((response) => {                          // must be then, not a callback
        // console.log(response.res.session);
        // console.log(response.res);
        // console.log(response._body);
        // console.log(Object.keys(response));
        // expect(response.statusCode).to.equal(200);
        // expect(response.body).to.equal({ data: true });
        return response;
      })
      .catch((errs) => {
        console.warn(errs);
        throw errs;
      });
      // .end((errs, response) => { //dont use end here as we want to use the response in the call back function maybe later.
      //   if (errs) {
      //     console.warn(errs);
      //     throw errs;
      //   }
      //   console.log(response.res.session);
      //   console.log(response.res);
      //   console.log(response._body);
      //   console.log(Object.keys(response));
      //   expect(response.statusCode).to.equal(200);
      //   expect(response._body).to.equal({ data: true });
      //   return response;
      // });
  } catch (loginErr) {
    console.warn('test/utils.js: Lifecycle.test failed to login with test service account: ' + loginErr);
    return loginErr;
  }
};

const logout = async function (verbose=false) {
  try {

    if(verbose){
      console.log('Logout with Test Account');
    }


    return request(sails.hooks.http.app)
      .get("/api/v1/admin/logout")
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
    console.warn('test/utils.js: Lifecycle.test failed to logout with test service account: ' + logoutErr);
    throw logoutErr;
  }
};

const logoutCbLogin = async (cb, verbose = false) =>
  logout(verbose)
    .then(() => cb())
    .then((unused) => login(verbose));

const callAuthActionWithCookie = async (cb, verbose=false) =>
  login(verbose)
    .then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(Object.keys(response.headers)).to.deep.include("set-cookie");
      expect(response.body).to.deep.equal({
        data: {
          email: "test.service@example.com",
          phoneNoCountry: 9993137777,
          phoneCountryCode: 44,
          name: "TEST_SERVICE",
          isSuperAdmin: true,
          role: "admin",
          firebaseSessionToken: "DUMMY_FIREBASE_TOKEN",
          secret: envConfig["test_secret"],
        },
      });
      const sessionCookie = response.headers["set-cookie"];
      if(verbose){
        console.log('SESSION COOKIE: "' + sessionCookie + '"');
      }
      return cb(sessionCookie);
    });

module.exports = {
  login,
  logout,
  logoutCbLogin,
  callAuthActionWithCookie,
};
