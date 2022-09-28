/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/Vendors/view-all-vendors.test.js
const { expect } = require("chai");
var supertest = require("supertest");
const { logoutCbLogin, callAuthActionWithCookie } = require("../../../utils");

// ~ https://www.chaijs.com/api/bdd/

describe("Fetch Vendors Controller Tests", () => {
  describe("view-all-vendors() returns a 200 with json when authenticated", () => {
    it("Returns All Vendors (1)", (done) => {
      const cb = (cookie) =>
        supertest(sails.hooks.http.app)
          .get("/api/v1/vendors?outcode=L1")
          .set("Cookie", cookie)
          .set("Accept", "application/json")
          .expect(200)
          .then((response) => {
            console.log('StatusCode resonse was: ' + response.statusCode);
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.property("vendors");
            expect(response.body['vendors']).to.have.lengthOf(1);
            return done();
          })
          .catch((errs) => {
            console.warn(errs);
            return done(errs);
          });
      callAuthActionWithCookie(cb);
    });
  });
  describe("view-all-vendors() returns a 403 with a view when unAuthenticated", () => {
    it("GET return 403", (done) => {
      const cb = () =>
        supertest(sails.hooks.http.app)
          .get("/api/v1/vendors")
          .set("Accept", "application/json")
          .set("Cookie", '')
          .expect(403)
          .then((response) => {
            expect(response.statusCode).to.equal(403);
            return done();
          })
          .catch((errs) => {
            console.warn(errs);
            return done(errs);
          });
      cb();
    });
  });
});
