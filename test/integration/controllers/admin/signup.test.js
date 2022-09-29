/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/Vendors/view-all-vendors.test.js
const { expect } = require("chai");
var supertest = require("supertest");
const { login, callAuthActionWithCookie } = require("../../../utils");

// ~ https://www.chaijs.com/api/bdd/

const genUserName = (id, busType) => `Can Signup Password ${busType} User${id}`;
const genUserEmail = (id, busType) => `User${id}@example.com`;
const genUserPhoneNoCountry = (id, busType) => Number.parseInt(`${id}790553251200000`.substring(0, 11));

describe("Signup Tests", () => {
  describe("Can get signup view", () => {
    it("returns 200", (done) => {
      supertest(sails.hooks.http.app)
        .get("/admin/signup")
        .set("Cookie", "")
        .set("Accept", "text/html")
        .expect(200)
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.text).to.have.string(
            '<div id="signup" class="admin" v-cloak>'
          );
          done();
          return response;
        })
        .catch((errs) => {
          console.warn(errs);
          done(errs);
          return errs;
        });
    });
  });
  describe("Can Register User", () => {
    // it("Can Register Vendor User using Email & Password", (done) => {
    //   supertest(sails.hooks.http.app) //TODO: Convert the mock firebase using the Firebase Emulator Sweet for Web Apps
    //     .post("/api/v1/admin/signup-with-password")
    //     .send({
    //       phoneNoCountry: 44,
    //       phoneCountryCode: 7905511111,
    //       email: "user@example.com",
    //       password: "DummyPass123",
    //       name: "Can Signup Password Vendor User",
    //       vendor: 1,
    //       courier: null,
    //       role: "vendor",
    //       vendorRole: "inventoryManager",
    //       courierRole: "none",
    //     })
    //     .expect(200)
    //     .then((response) => {
    //       // must be then, not a callback
    //       // console.log(response.res.session);
    //       // console.log(response.res);
    //       // console.log(response._body);
    //       // console.log(Object.keys(response));
    //       expect(response.statusCode).to.equal(200);
    //       expect(response.body).to.have.property("data");
    //       expect(response.body["data"]).to.have.property("fbUid");
    //       done();
    //       return response;
    //     })
    //     .catch((errs) => {
    //       console.warn(errs);
    //       done(errs);
    //       return errs;
    //     });
    // });
    it("Can Register Vendor User using Phone (no firebase)", (done) => {
      const userName = genUserName(1, 'vendor');
      const userEmail = genUserEmail(1, 'vendor');
      const userPhone = genUserPhoneNoCountry(1, 'vendor');
      supertest(sails.hooks.http.app)
        .post("/api/v1/admin/signup")
        .send({
          phoneNoCountry: userPhone,
          phoneCountryCode: 1,
          email: userEmail,
          name: userName,
          vendor: 1,
          courier: null,
          role: "vendor",
          vendorRole: "inventoryManager",
          courierRole: "none",
        })
        .expect(200)
        .then((response) => {
          // must be then, not a callback
          // console.log(response.res.session);
          // console.log(response.res);
          expect(response.statusCode).to.equal(200);
          expect(response._body).to.have.property("data");
          expect(response._body["data"]).to.deep.include({
            // firebaseSessionToken: "REGISTERING_USER", * These are hid from JSON remember
            name: userName,
          });
          done();
          return response;
        })
        .catch((errs) => {
          console.warn("error code text: " + response.body.code);
          console.warn("error call problems: " + response.body.problems);
          console.warn("error message: " + response.body.message);
          console.warn(errs);
          done(errs);
          return errs;
        });
    });
    it("Registration using Phone throws userExists if user already exists", (done) => {
      User.findOne({
        phoneNoCountry: 7905532512,
        phoneCountryCode: 44,
      })
        .then((user) => {
          return user;
        })
        .then((user) => {
          return supertest(sails.hooks.http.app)
            .post("/api/v1/admin/signup")
            .send({
              phoneNoCountry: user.phoneNoCountry,
              phoneCountryCode: user.phoneCountryCode,
              email: user.email,
              name: user.name,
              vendor: user.vendor,
              courier: user.courier,
              role: user.role,
              vendorRole: user.vendorRole,
              courierRole: user.courierRole,
            })
            .expect(401);
        })
        .then((response) => {
          // must be then, not a callback
          // console.log(response.res.session);
          // console.log(response.res);
          expect(response.statusCode).to.equal(401);
          expect(response.headers).to.have.property("x-exit");
          expect(response.headers).to.deep.include({ "x-exit": "userExists" });
          expect(response.headers).to.have.property("x-exit-description");
          expect(response.text).to.equal("Unauthorized");
          done();
          return response;
        })
        .catch((errs) => {
          console.warn("error code text: " + response.body.code);
          console.warn("error call problems: " + response.body.problems);
          console.warn("error message: " + response.body.message);
          console.warn(errs);
          done(errs);
          return errs;
        });
    });
    it("Registration using Email and Password throws userExists if user already exists", (done) => {
      done();
    });
  });
});
