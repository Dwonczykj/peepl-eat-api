/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/admin/create-product.test.js
const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie } = require("../../../utils");
var util = require("util");
require("ts-node/register");

const ACTION_NAME = "create-product-option";
const ACTION_PATH = "admin";

describe(`Fetch ${ACTION_NAME} Tests`, () => {
  describe(`${ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns a new product option that has isRequired default to false", () => {
      const EXPECTED_RESPONSE = {
        name: "Test product",
        isRequired: false,
        values: [],
        product: 64,
      };
      const cb = async (cookie) => {
        try {
          const response = await supertest(sails.hooks.http.app)
            .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
            .send({ name: "testing", values: [], product: 64 })
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
    it("Returns a new product option that has isRequired set to true", () => {
      const EXPECTED_RESPONSE = {
        name: "Test required product",
        isRequired: true,
        values: [],
        product: 64,
      };
      const cb = async (cookie) => {
        try {
          const response = await supertest(sails.hooks.http.app)
            .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
            .send({ name: "testing", values: [], product: 64, isRequired: true })
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
