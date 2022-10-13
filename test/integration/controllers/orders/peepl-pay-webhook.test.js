// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");
const { fixtures } = require("../../../../scripts/build_db");
const { getNextWeekday } = require("../../../utils");
const {
  HttpAuthTestSender,
  ExpectResponse,
} = require("../../../httpTestSender");

const { v4: uuidv4 } = require("uuid");
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

const MARK_ORDER_AS_PAID = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "orders",
    ACTION_NAME: "peepl-pay-webhook",
    sendData: {
      publicId: null,
      status: "paid",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const MARK_ORDER_AS_PAYMENT_FAILED = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "orders",
    ACTION_NAME: "peepl-pay-webhook",
    sendData: {
      publicId: null,
      status: "failed",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const MARK_ORDER_AS_REFUNDED_SUCCESS = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "orders",
    ACTION_NAME: "peepl-pay-refund-webhook",
    sendData: {
      publicId: null,
      status: "success",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const MARK_ORDER_AS_REFUNDED_FAILED = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "orders",
    ACTION_NAME: "peepl-pay-refund-webhook",
    sendData: {
      publicId: null,
      status: "failure",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};

describe(`${
  MARK_ORDER_AS_PAID(fixtures).ACTION_NAME
} successfully flag order as paid`, () => {
  it("flags order as paid", async () => {
    try {
      const dummyPayId = "dummy_pay_id_" + uuidv4();
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentIntentId: dummyPayId,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(MARK_ORDER_AS_PAID(fixtures));
      const response = await hats.makeAuthCallWith(
        {
          publicId: dummyPayId,
        },
        []
      );

      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne({
        paymentIntentId: dummyPayId,
      });
      expect(newOrder.paymentIntentId).to.equal(dummyPayId);
      expect(newOrder.completedFlag).to.equal("");
      expect(newOrder.paymentStatus).to.equal("paid");
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("can flag order as payment failed", async () => {
    try {
      const dummyPayId = "dummy_pay_id_failure_" + uuidv4();
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentIntentId: dummyPayId,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        MARK_ORDER_AS_PAYMENT_FAILED(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          publicId: dummyPayId,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne({ paymentIntentId: dummyPayId });
      expect(newOrder.paymentIntentId).to.equal(dummyPayId);
      expect(newOrder.completedFlag).to.equal("");
      expect(newOrder.paymentStatus).to.equal("failed");
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${
  MARK_ORDER_AS_REFUNDED_SUCCESS(fixtures).ACTION_NAME
} successfully flag order as refunded`, () => {
  it("can flag order as refund succeeded and notifies users, vendors and vegisupport", async () => {
    try {
      const dummyPayId = "dummy_pay_id_failure_" + uuidv4();
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentIntentId: dummyPayId,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        MARK_ORDER_AS_REFUNDED_SUCCESS(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          publicId: dummyPayId,
          status: "success",
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne({
        publicId: parentOrder.publicId,
      });
      expect(newOrder.completedFlag).to.equal(
        "refunded",
        util.inspect(newOrder, { depth: null })
      );
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("can notify users, vendors and vegisupport when a refund fails", async () => {
    try {
      const dummyPayId = "dummy_pay_id_failure_" + uuidv4();
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentIntentId: dummyPayId,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        MARK_ORDER_AS_REFUNDED_FAILED(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          publicId: dummyPayId,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne({
        publicId: parentOrder.publicId,
      });
      expect(newOrder.completedFlag).to.not.equal("refunded");
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
