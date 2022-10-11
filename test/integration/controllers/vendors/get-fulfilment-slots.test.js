/* eslint-disable no-console */
/* eslint-disable no-undef */
// test/integration/controllers/Vendors/get-fulfilment-slots.test.js
const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { callAuthActionWithCookie } = require("../../../utils");
var util = require("util");
require("ts-node/register");

const ACTION_NAME = "get-fulfilment-slots";
const ACTION_PATH = "vendors";

const EXAMPLE_RESPONSE = {
  collectionMethod: {},
  deliveryMethod: {},
  collectionSlots: {},
  deliverySlots: {},
  eligibleCollectionDates: {},
  eligibleDeliveryDates: {},
};


describe(`Fetch ${ACTION_NAME} Tests`, () => {
  describe(`${ACTION_NAME}() returns a 200 with json when authenticated`, () => {
    it("Returns All Fulfilment Slots for a given vendor (3)", async () => {
      const cb = async (cookie) => {
        try {
	        const response = await supertest(sails.hooks.http.app)
            .get(`/api/v1/${ACTION_PATH}/${ACTION_NAME}`)
            .set("Cookie", cookie)
            .set("Accept", "application/json");
	        expect(response.statusCode).to.equal(200);
          for (prop of Object.keys(EXAMPLE_RESPONSE)){
	          expect(response.body).to.have.property(prop);
          }
          // expect(response.body[RESPONSE_KEY]).to.have.lengthOf(1);
        } catch (errs) {
          console.warn(errs);
          throw errs;
        }
      };
      await callAuthActionWithCookie(cb);
    });
  });
});
