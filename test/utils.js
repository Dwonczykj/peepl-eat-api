/* eslint-disable no-console */
/* eslint-disable no-undef */
const { expect } = require("chai");
const request = require('supertest');
const dotenv = require('dotenv');
const envConfig = dotenv.config('./env').parsed;

const login = async function () {
  try {

    console.log('Login with Test Account');

    // request(sails.hooks.http.app)
    //     .get('/csrfToken')
    //     .set('Accept', 'application/json')
    //     .then(response => {
    //         console.log(response.body);
    //         this._csrf = response.body._csrf;
    //         console.log('Sails lifted!');
    //     })
    //     .catch(err => err);

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

const logout = async function () {
  try {

    console.log('Logout with Test Account');


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
    return done(login_err);
  }
};

const logoutCbLogin = async (cb) => logout().then(() => cb()).then((unused) => login());

const callAuthActionWithCookie = async (cb) =>
  login()
    .then((response) => {
      expect(response.statusCode).to.equal(200);
      expect(Object.keys(response.headers)).to.include("set-cookie");
      expect(response.body).to.deep.equal({ data: true });
      const sessionCookie = response.headers["set-cookie"];
      console.log('SESSION COOKIE: "' + sessionCookie + '"');
      return cb(sessionCookie);
    })
    .catch((errs) => done(errs));

module.exports = {
  login,
  logout,
  logoutCbLogin,
  callAuthActionWithCookie,
};
