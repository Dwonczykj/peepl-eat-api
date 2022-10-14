// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");
const {fixtures} = require("../../../../scripts/build_db");
const {getNextWeekday} = require("../../../utils");
const { HttpAuthTestSender, ExpectResponse } = require('../../../httpTestSender');

const {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
} = require("./defaultOrder");

const { v4: uuidv4 } = require("uuid");

const GET_ORDER_STATUS = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "get",
    ACTION_PATH: "orders",
    ACTION_NAME: "get-order-status",
    sendData: {
      orderId: 1,
    },
    expectResponse: {
      paymentStatus: "unpaid",
      restaurantAcceptanceStatus: "pending",
    },
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property("paymentStatus");
      expect(response.body).to.have.property("restaurantAcceptanceStatus");
      assert.isBoolean(response.body.restaurantAcceptanceStatus);
      return;
    },
  };
};

describe(`${
  GET_ORDER_STATUS(fixtures).ACTION_NAME
}() successfully gets order status`, () => {
  it("Order status correct", async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(GET_ORDER_STATUS(fixtures));
      const response = await hats.makeAuthCallWith({}, []);

      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
