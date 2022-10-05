/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/Vendors/view-all-vendors.test.js
const { expect } = require("chai");
var supertest = require("supertest");
const { login, callAuthActionWithCookie } = require("../../../utils");

// ~ https://www.chaijs.com/api/bdd/


describe("Authentication Tests", () => {
  describe("Login Tests", () => {
    it("GET view-login", (done) => {
      supertest(sails.hooks.http.app)
        .get("/admin/login")
        .set("Cookie", "")
        .expect(200)
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.text).to.have.string(
            '<div id="login" class="admin" v-cloak>'
          );
          return done();
        })
        .catch((errs) => {
          console.warn(errs);
          return done(errs);
        });
    });
    it("POST login-with-secret works", (done) => {
      login()
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(Object.keys(response.headers)).to.deep.include("set-cookie");
          expect(response.body).to.deep.equal({ data: true });
          return done();
        })
        .catch((errs) => done(errs));
    });
    it("GET logged-in returns true when authenticated", (done) => {
      const cb = (cookie) => supertest(sails.hooks.http.app)
        .get("/api/v1/admin/logged-in")
        .set("Cookie", cookie)
        .expect(200) 
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response._body).to.deep.equal({ data: true });
          return done();
        })
        .catch(errs => {
          console.warn(errs);
          return done(errs);
        });
      // login()
      //   .then((response) => {
      //     expect(response.statusCode).to.equal(200);
      //     expect(Object.keys(response.headers)).to.deep.include("set-cookie");
      //     expect(response.body).to.deep.equal({ data: true });
      //     const sessionCookie = response.headers["set-cookie"];
      //     return cb(sessionCookie);
      //   })
      //   .catch((errs) => done(errs));
      callAuthActionWithCookie(cb, true);
    });
    it("GET logged-in returns false when not signed in", (done) => {
      supertest(sails.hooks.http.app)
        .get("/api/v1/admin/logged-in")
        .set("Cookie", "")
        .expect(200, (errs, response, body) => {
          if (errs) {
            console.warn(errs);
            return done(errs);
          }
          expect(response.statusCode).to.equal(200);
          expect(response._body).to.deep.equal({ data: false });
          return done();
        });
    });
  });
});
