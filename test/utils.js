/* eslint-disable no-console */
/* eslint-disable no-undef */
const { expect, assert } = require("chai");
const request = require('supertest');
const dotenv = require('dotenv');
const util = require("util");
const envConfig = dotenv.config({path: process.cwd() + "/test/.env"}).parsed;

assert.containsAllKeys(
  envConfig,
  [
    "test_TEST_SERVICE_secret",
    "test_TEST_USER_secret",
    "test_TEST_VENDOR_secret",
    "test_TEST_DELIVERY_PARTNER_secret",
    "FIREBASE_AUTH_EMULATOR_HOST",
  ],
  ".env config does not contain secrets for testing: " +
    util.inspect(envConfig, { depth: 1 })
);

const login = async function (verbose=false) {
  try {
    if(verbose){
      console.log('Login with Test Account');
    }

    return request(sails.hooks.http.app)
      .post("/api/v1/admin/login-with-secret")
      .send({
        name: "TEST_SERVICE",
        secret: envConfig["test_TEST_SERVICE_secret"],
      })
      .expect(200)
      .then((response) => {
        // must be then, not a callback
        // console.log(response.res.session);
        // console.log(response.res);
        // console.log(response._body);
        // console.log(Object.keys(response));
        // expect(response.statusCode).to.equal(200,
        //   `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
        //     depth: null,
        //   })} with trace: ${util.inspect(response.body.traceRef, {
        //     depth: null,
        //   })}`
        // );
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
    //   expect(response.statusCode).to.equal(200,
    //   `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
    //     depth: null,
    //   })} with trace: ${util.inspect(response.body.traceRef, {
    //     depth: null,
    //   })}`
    // );
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

const callAuthActionWithCookie = async (cb, verbose=false, data={}) =>
  login(verbose)
    .then((response) => {
      expect(response.statusCode).to.equal(200, 'Login-with-secret wrapper failed to login: ' + util.inspect(response, {depth: null}));
      expect(Object.keys(response.headers)).to.deep.include("set-cookie");
      const sessionCookie = response.headers["set-cookie"];
      if(verbose){
        console.log('SESSION COOKIE: "' + sessionCookie + '"');
      }
      return cb(sessionCookie);
    });

function getNextWeekday(weekday) {
  // ~ https://stackoverflow.com/a/25493271
  assert.include([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],weekday);
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayInd = weekdays.indexOf(weekday.toLowerCase());
  var today = new Date();
  var theDay;
  var day = today.getDay();
  if (day === dayInd) {
    return (
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
  } else {
    day = today.getDay();
    var dateOfFirstDayOfThisWeek = today.getDate() - day;
    var dateOfFirstDayOfNextWeek = dateOfFirstDayOfThisWeek + 7;
    if (today.getDay() < dayInd){
      theDay = dateOfFirstDayOfThisWeek + dayInd;
    } else {
      theDay = dateOfFirstDayOfNextWeek + dayInd;
    }
  }
  closest = new Date(today.setDate(theDay));
  
  return (
    closest.getFullYear() +
    "-" +
    (closest.getMonth() + 1) +
    "-" +
    closest.getDate()
  );
}

// console.log(getNextWeekday('thursday') + 'is next thursday');
// console.log(getNextWeekday("monday") + "is next monday");

module.exports = {
  login,
  logout,
  logoutCbLogin,
  callAuthActionWithCookie,
  envConfig,
  getNextWeekday,
};
