/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/admin/create-product.test.js
const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie } = require("../../../utils");
var util = require("util");
require("ts-node/register");

const ACTION_NAME = "edit-vendor-postal-districts";
const ACTION_PATH = "admin";

describe(`Fetch ${ACTION_NAME} Tests`, () => {
  describe(`${ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns a updated postal districts for vendor", () => {
      const EXPECTED_RESPONSE = {
        vendorId: 1,
        districts: [1, 2],
      };
      const cb = async (cookie) => {
        try {
          const response = await supertest(sails.hooks.http.app)
            .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
            .send({
              vendorId: 1,
              districts: [1, 2],
            })
            .set("Cookie", cookie)
            .set("Accept", "application/json");
          expect(response.statusCode).to.equal(200);
          for (prop of Object.keys(EXPECTED_RESPONSE)) {
            expect(response.body).to.have.property(prop);
          }
          expect(response.body).to.deep.equal(EXPECTED_RESPONSE);
        } catch (errs) {
          console.warn(errs);
          throw errs;
        }
      };
      callAuthActionWithCookie(cb);
    });
  });
});
