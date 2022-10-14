// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require("util");
const moment = require("moment/moment");
require("ts-node/register");
const { fixtures } = require("../../../../scripts/build_db");
const { getNextWeekday } = require("../../../utils");

const { v4: uuidv4 } = require("uuid");

const {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
} = require("./defaultOrder");

const CUSTOMER_RECEIVED_ORDER_GOOD = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-received-order",
    sendData: {
      orderId: null,
      orderReceived: true,
      orderCondition: 4,
      deliveryPunctuality: 5,
      feedback: "punctual and good condition",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_POOR_CONDITION = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-received-order",
    sendData: {
      orderId: null,
      orderReceived: true,
      orderCondition: 0,
      deliveryPunctuality: 5,
      feedback: "punctual and good condition",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_NOT_RECEIVED = (fixtures) => {
  return {
    useAccount: "TEST_USER",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-received-order",
    sendData: {
      orderId: null,
      orderReceived: false,
      orderCondition: 0,
      deliveryPunctuality: 0,
      feedback: "Order not received. Why?",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_LATE_DELIVERY = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-received-order",
    sendData: {
      orderId: null,
      orderReceived: true,
      orderCondition: 4,
      deliveryPunctuality: 0,
      feedback: "delivery late and good condition",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_ORDER_COND = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-received-order",
    sendData: {
      orderId: null,
      orderReceived: true,
      orderCondition: -1, // Deliberate Bad Input must be > 0
      deliveryPunctuality: 5,
      feedback: "some feedback",
    },
    expectResponse: {},
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_RECEIVED_ORDER_BAD_INPUT_DELV_PUNCT = (fixtures) => {
  return {
    useAccount: "TEST_SERVICE",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-received-order",
    sendData: {
      orderId: null,
      orderReceived: true,
      orderCondition: 4,
      deliveryPunctuality: 6, // ! Deliberately bad input > 5
      feedback: "some feedback",
    },
    expectResponse: {},
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};

describe(`${CUSTOMER_RECEIVED_ORDER_GOOD(fixtures).ACTION_NAME}()`, () => {
  it("users can successfully confirm order was received in good condition", async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_RECEIVED_ORDER_GOOD(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          orderReceived: true,
          orderCondition: 4,
          deliveryPunctuality: 5,
          feedback: "punctual and good condition",
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.completedFlag).to.equal("completed");
      expect(newOrder.completedOrderFeedback).to.equal(
        "punctual and good condition"
      );
      expect(newOrder.orderCondition).to.equal(4);
      expect(newOrder.deliveryPunctuality).to.equal(5);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("users can successfully confirm order was received in POOR condition", async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_RECEIVED_ORDER_POOR_CONDITION(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          orderCondition: 0,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.orderCondition).to.equal(0);
      expect(newOrder.completedFlag).to.equal("completed");
      expect(newOrder.completedOrderFeedback).to.equal(
        "punctual and good condition"
      );
      expect(newOrder.deliveryPunctuality).to.equal(5);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("users can successfully confirm order was received LATE", async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_RECEIVED_ORDER_LATE_DELIVERY(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          orderCondition: 4,
          deliveryPunctuality: 0,
          feedback: "delivery late and good condition",
        },
        []
      );

      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.deliveryPunctuality).to.equal(0);
      expect(newOrder.orderCondition).to.equal(4);
      expect(newOrder.completedFlag).to.equal("completed");
      expect(newOrder.completedOrderFeedback).to.equal(
        "delivery late and good condition"
      );
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("users can successfully confirm order was NOT RECEIVED", async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_RECEIVED_ORDER_NOT_RECEIVED(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          orderReceived: false,
          orderCondition: 0,
          deliveryPunctuality: 0,
          feedback: "Order not received. Why?",
        },
        []
      );

      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.completedFlag).to.equal("");
      assert.isNull(newOrder.deliveryPunctuality);
      assert.isNull(newOrder.orderCondition);
      assert.isNull(newOrder.completedOrderFeedback);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("API will not accept bad delivery punctuality input", async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_RECEIVED_ORDER_BAD_INPUT_DELV_PUNCT(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          deliveryPunctuality: 6,
        },
        []
      );

      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.completedFlag).to.equal("");
      assert.isNull(newOrder.deliveryPunctuality);
      assert.isNull(newOrder.orderCondition);
      assert.isNull(newOrder.completedOrderFeedback);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("API will not accept bad order condition input", async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_RECEIVED_ORDER_BAD_INPUT_ORDER_COND(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          orderCondition: -1,
        },
        []
      );

      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.completedFlag).to.equal("");
      assert.isNull(newOrder.deliveryPunctuality);
      assert.isNull(newOrder.orderCondition);
      assert.isNull(newOrder.completedOrderFeedback);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
