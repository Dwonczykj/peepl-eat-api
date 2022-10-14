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

const CUSTOMER_CANCEL_ORDER_FAILS_WITHOUT_PYMNTINTNTID = (fixtures) => {
  return {
    useAccount: "TEST_USER",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-cancel-order",
    sendData: {
      orderId: null,
      customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    },
    expectResponse: {},
    expectStatusCode: 501,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const CUSTOMER_CANCEL_ORDER = (fixtures) => {
  return {
    useAccount: "TEST_USER",
    HTTP_TYPE: "post",
    ACTION_PATH: "admin",
    ACTION_NAME: "customer-cancel-order",
    sendData: {
      orderId: null,
      customerWalletAddress: "0x41190Dd82D43129C26955063fa2854350e14554B",
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};

describe(`${CUSTOMER_CANCEL_ORDER(fixtures).ACTION_NAME}()`, () => {
  it("users can successfully CANCEL an accepted order", async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentStatus: "paid",
          paymentIntentId: "dummy_payint_id_" + uuidv4(),
          restaurantAcceptanceStatus: "accepted",
          completedFlag: "",
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(CUSTOMER_CANCEL_ORDER(fixtures));
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          customerWalletAddress: parentOrder.customerWalletAddress,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.completedFlag).to.equal("cancelled");
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("users can successfully CANCEL an accepted order and revert the PPL Issued", async () => {
    try {
      const calcRewardsIssued =
        5425 * sails.config.custom.PPLTokenValueInPence * 0.05;
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentStatus: "paid",
          paymentIntentId: "dummy_payint_id_" + uuidv4(),
          rewardsIssued: calcRewardsIssued,
          restaurantAcceptanceStatus: "accepted",
          completedFlag: "",
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(CUSTOMER_CANCEL_ORDER(fixtures));
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          customerWalletAddress: parentOrder.customerWalletAddress,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.completedFlag).to.equal("cancelled");
      expect(newOrder.rewardsIssued).to.equal(calcRewardsIssued);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it("users can successfully CANCEL a partially fulfilled order", async () => {
    try {
      const _parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentStatus: "paid",
          paymentIntentId: "dummy_payint_id_" + uuidv4(),
          restaurantAcceptanceStatus: "partially fulfilled",
          completedFlag: "void",
          parentOrder: null,
          items: [],
          total: 5425,
        })
      ).fetch();
      const parentOrder = await Order.findOne(_parentOrder.id).populate(
        "vendor"
      );
      const suitableProducts = await Product.find({
        vendor: parentOrder.vendor.id,
        isAvailable: true,
      });
      assert.isNotEmpty(suitableProducts);

      const originallyFulfilledItems = await OrderItem.createEach(
        suitableProducts.map((product) => ({
          order: parentOrder.id,
          product: product.id,
          unfulfilled: false,
          unfulfilledOnOrderId: null,
        }))
      ).fetch();
      const oldItemIds = originallyFulfilledItems.map((item) => item.id);
      await Order.replaceCollection(parentOrder.id, "items", oldItemIds);

      const unfulfilProduct = suitableProducts[0];

      const _childOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentStatus: "paid",
          restaurantAcceptanceStatus: "",
          parentOrder: parentOrder.id,
          paymentIntentId: parentOrder.paymentIntentId,
          completedFlag: "",
          items: oldItemIds,
          total: 5425 - unfulfilProduct.basePrice,
        })
      ).fetch();
      const childOrder = await Order.findOne(_childOrder.id).populate("vendor");

      const unfulfilledItem = await OrderItem.create({
        order: childOrder.id,
        product: unfulfilProduct.id,
        unfulfilled: true,
        unfulfilledOnOrderId: parentOrder.id,
      }).fetch();

      // await Order.replaceCollection(childOrder.id, "items", unfulfilledItems);
      const hats = new HttpAuthTestSenderOrder(CUSTOMER_CANCEL_ORDER(fixtures));
      const response = await hats.makeAuthCallWith(
        {
          orderId: childOrder.publicId,
          customerWalletAddress: childOrder.customerWalletAddress,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const updatedParentOrder = await Order.findOne(parentOrder.id);
      const updatedOrder = await Order.findOne(childOrder.id);
      expect(updatedParentOrder.completedFlag).to.equal("void");
      expect(updatedOrder.completedFlag).to.equal("cancelled");
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it(`${
    CUSTOMER_CANCEL_ORDER_FAILS_WITHOUT_PYMNTINTNTID(fixtures).ACTION_NAME
  } fails with ${
    CUSTOMER_CANCEL_ORDER_FAILS_WITHOUT_PYMNTINTNTID(fixtures).expectStatusCode
  } when order.paymentIntentId is not set`, async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentStatus: "paid",
          restaurantAcceptanceStatus: "accepted",
          paymentIntentId: "",
          completedFlag: "",
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_CANCEL_ORDER_FAILS_WITHOUT_PYMNTINTNTID(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          customerWalletAddress: parentOrder.customerWalletAddress,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne(parentOrder.id);
      expect(newOrder.completedFlag).to.equal(
        "cancelled",
        `Should still be cancelled in any event before method tries to revert the payments`
      );
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
