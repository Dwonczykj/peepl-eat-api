/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/admin/create-vendor.test.js
const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie } = require("../../../utils");
var util = require("util");
require("ts-node/register");

const ACTION_NAME = "create-vendor";
const ACTION_PATH = "admin";

const EXAMPLE_RESPONSE = {
  collectionMethod: {},
  deliveryMethod: {},
  collectionSlots: {},
  deliverySlots: {},
  eligibleCollectionDates: {},
  eligibleDeliveryDates: {},
};

const createVendor = {
  name: "Test vendor",
  description: "This is a test.",
  type: "restaurant",
  walletAddress: "0x6ad1D130d8B4F6f2D133E172799484B653c9fb40",
  phoneNumber: "+447123456789",
  status: "draft",
};

describe(`Fetch ${ACTION_NAME} Tests`, () => {
  describe(`${ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns a new vendor", () => {
      const cb = async (cookie) => {
        try {
          const response = await supertest(sails.hooks.http.app)
            .post(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
            .send({
              name: "Test vendor",
              description: "This is a test.",
              type: "restaurant",
              walletAddress: "0x6ad1D130d8B4F6f2D133E172799484B653c9fb40",
              phoneNumber: "+447123456789",
              status: "draft",
            })
            .set("Cookie", cookie)
            .set("Accept", "application/json");
          expect(response.statusCode).to.equal(200);
          for (prop of Object.keys(EXAMPLE_RESPONSE)) {
            expect(response.body).to.have.property(prop);
          }
          // expect(response.body[RESPONSE_KEY]).to.have.lengthOf(1);
        } catch (errs) {
          console.warn(errs);
          throw errs;
        }
      };
      callAuthActionWithCookie(cb);
    });
  });
});
