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

const { v4: uuidv4 } = require('uuid');
/* Check if string is valid UUID */
function checkIfValidUUID(str) {
  // Regular expression to check if string is a valid UUID
  // ~ https://melvingeorge.me/blog/check-if-string-valid-uuid-regex-javascript
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
}

const DEFAULT_NEW_ORDER_OBJECT = (fixtures, overrides = {}) => ({
  ...{
    customerWalletAddress: "0xb98AEa2159e4855c8C703A19f57912ACAdCa3625",
    items: [1, 6, 7],
    total: 2800,
    tipAmount: 0,
    orderedDateTime: Date.now(),
    restaurantAcceptanceStatus: "accepted",
    marketingOptIn: false,
    vendor: 1,
    paidDateTime: null,
    refundDateTime: null,
    deliveryName: "Test Runner 1",
    deliveryEmail: "adam@itsaboutpeepl.com",
    deliveryPhoneNumber: "07901122212",
    deliveryAddressLineOne: "11 Feck Street",
    deliveryAddressLineTwo: "Subburb",
    deliveryAddressCity: "Liverpool",
    deliveryAddressPostCode: "L1 0AB",
    deliveryAddressInstructions: "Leave it behind the bin",
    fulfilmentMethod: 1,
    fulfilmentSlotFrom: "2023-10-12 11:00:00",
    fulfilmentSlotTo: "2023-10-12 12:00:00",
    discount: null,
    paymentStatus: "unpaid",
    paymentIntentId: "",
    deliveryId: "random_delivery_id",
    deliveryPartnerAccepted: true,
    deliveryPartnerConfirmed: true,
    deliveryPartner: 1,
    rewardsIssued: 0,
    sentToDeliveryPartner: false,
    completedFlag: "",
    completedOrderFeedback: null,
    deliveryPunctuality: null,
    orderCondition: null,
    unfulfilledItems: [], //Check using partial orders
    parentOrder: null,
  },
  ...overrides,
});

class ExpectResponseOrder extends ExpectResponse {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    sendData = {},
    expectResponse = {},
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
    });
  }

  customChecks({ responseBody, expectedResponse }) {
    expect(responseBody.orderedDateTime).closeTo(
      expectedResponse.orderedDateTime,
      100,
      "OrderedDateTime should be within 100s of test."
    );
    // ~ https://devenum.com/delete-property-from-objects-array-in-javascript/#:~:text=Delete%20property%20from%20objects%20Array%20in%20Javascript%20%286,to%20Delete%20property%20from%20objects%20array%20in%20Javascript
    delete expectedResponse.orderedDateTime;
    expect(checkIfValidUUID(responseBody.publicId)).to.equal(true);
    delete expectedResponse.publicId;
    return expectedResponse;
  }
}

class HttpAuthTestSenderOrder extends HttpAuthTestSender {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PREFIX = "/api/v1",
    ACTION_PATH = "",
    ACTION_NAME = "",
    useAccount = "TEST_SERVICE",
    sendData = {},
    expectResponse = {},
    expectResponseCb = async (response, requestPayload) => {},
    expectStatusCode = 200,
  }) {
    super({
      HTTP_TYPE,
      ACTION_PREFIX,
      ACTION_PATH,
      ACTION_NAME,
      useAccount,
      sendData,
      expectResponse,
      ExpectResponseOrder,
      expectResponseCb,
      expectStatusCode,
    });
  }
}

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
