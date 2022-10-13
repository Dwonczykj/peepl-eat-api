/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/admin/create-product.test.js
const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie } = require("../../../utils");
var util = require("util");
require("ts-node/register");

const ACTION_NAME = "create-product";
const ACTION_PATH = "admin";

describe(`Fetch ${ACTION_NAME} Tests`, () => {
  describe(`${ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns a new product", async () => {
      const EXPECTED_RESPONSE = {
        name: "Test product",
        description: "This is a test.",
        shortDescription: '',
        basePrice: 100,
        imageUrl: '',
        isAvailable: false,
        priority: null,
        isFeatured: false,
        status: 'inactive',
        vendor: 11,
        options: [],
        category: 1,
      };
      const cb = async (cookie) => {
        try {
          console.info(`POST /api/v1/${ACTION_PATH}/${ACTION_NAME}`);
          const response = await supertest(sails.hooks.http.app)
            .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
            .send({
              name: "Test product",
              description: "This is a test.",
              basePrice: 100,
              isAvailable: "false",
              isFeatured: "false",
              vendor: 11,
              category: 1,
            })
            .set("Cookie", cookie)
            .set("Accept", "application/json");
          expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
          for (prop of Object.keys(EXPECTED_RESPONSE)) {
            expect(response.body).to.have.property(prop);
          }
          expect(response.body).to.deep.equal(EXPECTED_RESPONSE);
        } catch (errs) {
          console.warn(errs);
          throw errs;
        }
      };
      await callAuthActionWithCookie(cb);
      return;
    });
  });
});
