// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require('util');
const moment = require('moment/moment');
require('ts-node/register');
const { fixtures } = require('../../../../scripts/build_db');
const { getNextWeekday } = require('../../../utils');
const {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
} = require('./defaultOrder');

const { v4: uuidv4 } = require('uuid');

const VIEW_APPROVE_ORDER = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'approve-order/:orderId',
    sendData: {
      orderId: fixtures.orders[0].publicId,
    },
    expectResponse: null,
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      expect(response.body).to.have.property('order');
      return;
    },
  };
};

const APPROVE_OR_DECLINE_ORDER_ACCEPT = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'approve-or-decline-order',
    sendData: {
      orderId: null, // populate from parentOrder
      orderFulfilled: 'accept', //['accept', 'reject', 'partial'],
      retainItems: [],
      removeItems: [],
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal('accepted');
      expect(order.rewardsIssued).to.be.greaterThan(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_REJECT = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'approve-or-decline-order',
    sendData: {
      orderId: null,
      orderFulfilled: 'reject', //['accept', 'reject', 'partial'],
      retainItems: [],
      removeItems: [],
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal('rejected');
      expect(order.rewardsIssued).to.equal(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_FAILS_IF_ALREADY_ACCEPTED = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'approve-or-decline-order',
    sendData: {
      orderId: null,
      orderFulfilled: 'reject', //['accept', 'reject', 'partial'],
      retainItems: [],
      removeItems: [],
    },
    expectResponse: {},
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal('rejected');
      expect(order.rewardsIssued).to.equal(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_FAILS_IF_NOT_PAID_FOR = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'approve-or-decline-order',
    sendData: {
      orderId: null,
      orderFulfilled: 'reject', //['accept', 'reject', 'partial'],
      retainItems: [],
      removeItems: [],
    },
    expectResponse: {},
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal('rejected');
      expect(order.rewardsIssued).to.equal(0);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_PARTIAL = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'approve-or-decline-order',
    sendData: {
      orderId: null,
      orderFulfilled: 'partial', //['accept', 'reject', 'partial'],
      retainItems: [1, 2, 3, 6],
      removeItems: [8],
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal('partially fulfilled');
      expect(order.completedFlag).to.equal('void');
      expect(order.rewardsIssued).to.equal(0);
      const childOrder = await Order.findOne({
        parentOrder: order.id,
      }).populate('items');
      assert.exists(
        childOrder,
        `Unable to locate parentOrder with id: ${order.id}`
      );
      expect(childOrder).to.have.property('items');
      expect(
        childOrder.items.filter((item) => item.unfulfilled !== true)
      ).to.have.lengthOf(requestPayload.retainItems.length);
      expect(
        childOrder.items.filter((item) => item.unfulfilled === true)
      ).to.have.lengthOf(requestPayload.removeItems.length);
      return;
    },
  };
};
const APPROVE_OR_DECLINE_ORDER_PARTIAL_FAIL_INCOMPLETE_ITEMS = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'approve-or-decline-order',
    sendData: {
      orderId: null,
      orderFulfilled: 'partial', //['accept', 'reject', 'partial'],
      retainItems: [1, 6],
      removeItems: [8],
    },
    expectResponse: {},
    expectStatusCode: 400,
    expectResponseCb: async (response, requestPayload) => {
      assert.isEmpty(response.body);
      const order = await Order.findOne({
        publicId: requestPayload.orderId,
      });
      expect(order.restaurantAcceptanceStatus).to.equal('pending');
      expect(order.completedFlag).to.equal('');
      expect(order.rewardsIssued).to.equal(0);
      const childOrder = await Order.findOne({
        parentOrder: order.id,
      }).populate('items');
      assert.notExists(childOrder);
      return;
    },
  };
};

describe(`${VIEW_APPROVE_ORDER(fixtures).ACTION_NAME}()`, () => {
  it('successfully view approve-order screen for order from publicId', async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(VIEW_APPROVE_ORDER(fixtures));
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
        },
        []
      );
      hats.expectedResponse.checkResponse(response.body, parentOrder);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${APPROVE_OR_DECLINE_ORDER_ACCEPT(fixtures).ACTION_NAME}()`, () => {
  it('vendors can successfully accept an order from approve-or-decline-order action', async () => {
    try {
      const vendor = fixtures.vendors[0];
      const fulfilmentMethodVendor = fixtures.fulfilmentMethods.filter(
        (fm) =>
          fm.vendor === vendor.id &&
          fm.methodType === 'delivery' &&
          fixtures.openingHours.filter(
            (oh) => oh.fulfilmentMethod === fm.id && oh.isOpen === true
          )
      )[0];
      const openAtHours = fixtures.openingHours.filter(
        (openHrs) =>
          openHrs.isOpen === true &&
          openHrs.fulfilmentMethod === fulfilmentMethodVendor.id
      )[0];
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          restaurantAcceptanceStatus: 'pending',
          paymentStatus: 'paid',
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
          fulfilmentMethod: fulfilmentMethodVendor.id,
          fulfilmentSlotFrom:
            getNextWeekday(openAtHours.dayOfWeek) + ' 11:00:00',
          fulfilmentSlotTo: getNextWeekday(openAtHours.dayOfWeek) + ' 12:00:00',
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        APPROVE_OR_DECLINE_ORDER_ACCEPT(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('vendors can successfully reject an order from approve-or-decline-order action', async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          restaurantAcceptanceStatus: 'pending',
          paymentStatus: 'paid',
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        APPROVE_OR_DECLINE_ORDER_REJECT(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('vendors cannot accept an order that has already been accepted from approve-or-decline-order action', async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          restaurantAcceptanceStatus: 'accepted',
          paymentStatus: 'paid',
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        APPROVE_OR_DECLINE_ORDER_FAILS_IF_ALREADY_ACCEPTED(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
        },
        []
      );
      // await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('vendors cannot accept an order that has not been paid for from approve-or-decline-order action', async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          restaurantAcceptanceStatus: 'accepted',
          paymentStatus: 'unpaid',
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        APPROVE_OR_DECLINE_ORDER_FAILS_IF_NOT_PAID_FOR(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
        },
        []
      );
      // await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('vendors can partially accept an order from approve-or-decline-order action', async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          restaurantAcceptanceStatus: 'pending',
          paymentStatus: 'paid',
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        APPROVE_OR_DECLINE_ORDER_PARTIAL(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          orderFulfilled: 'partial', //['accept', 'reject', 'partial'],
          retainItems: [1, 2, 3, 6],
          removeItems: [8],
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('vendors can partially accept an order from approve-or-decline-order action with items missing from the union of retain and remove orders payload', async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          restaurantAcceptanceStatus: 'pending',
          paymentStatus: 'paid',
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        APPROVE_OR_DECLINE_ORDER_PARTIAL_FAIL_INCOMPLETE_ITEMS(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          orderFulfilled: 'partial', //['accept', 'reject', 'partial'],
          retainItems: [1, 6],
          removeItems: [8],
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
