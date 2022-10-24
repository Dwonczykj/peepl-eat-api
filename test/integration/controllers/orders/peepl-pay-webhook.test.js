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
  HttpAuthTestSender,
  ExpectResponse,
} = require('../../../httpTestSender');

const {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
} = require('./defaultOrder');

const { v4: uuidv4 } = require('uuid');

const MARK_ORDER_AS_PAID = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'orders',
    ACTION_NAME: 'peepl-pay-webhook',
    sendData: {
      publicId: null,
      status: 'paid',
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
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'orders',
    ACTION_NAME: 'peepl-pay-webhook',
    sendData: {
      publicId: null,
      status: 'failed',
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
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'orders',
    ACTION_NAME: 'peepl-pay-refund-webhook',
    sendData: {
      publicId: null,
      status: 'success',
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      const refunds = await Refund.find({
        paymentIntentId: requestPayload.publicId,
      });
      for (const refund of refunds) {
        expect(refund.refundStatus).to.equal(
          'paid',
          `Refund Status not set correctly on: ${util.inspect(refund, {
            depth: null,
          })}`
        );
      }

      const order = await Order.findOne({
        paymentIntentId: requestPayload.publicId,
      });
      assert.isNotNull(order);
      const smsNotificationsToCustomer = await Notification.find({
        recipient: order.deliveryPhoneNumber,
        type: 'sms',
      });
      assert.isNotEmpty(smsNotificationsToCustomer);
      const smsNotificationsToVendor = await Notification.find({
        recipient: order.vendor.phoneNumber,
        type: 'sms',
      });
      assert.isNotEmpty(smsNotificationsToVendor);
      return;
    },
  };
};
const MARK_ORDER_AS_REFUNDED_FAILED = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'orders',
    ACTION_NAME: 'peepl-pay-refund-webhook',
    sendData: {
      publicId: null,
      status: 'failure',
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      const refunds = await Refund.find({
        paymentIntentId: requestPayload.publicId,
      });
      for (const refund of refunds) {
        expect(refund.refundStatus).to.equal(
          'failed',
          `Refund Status not set correctly on: ${util.inspect(refund, {
            depth: null,
          })}`
        );
      }

      const order = await Order.findOne({
        paymentIntentId: requestPayload.publicId,
      });
      assert.isNotNull(order);
      const smsNotificationsToCustomer = await Notification.find({
        recipient: order.deliveryPhoneNumber,
        type: 'sms',
      });
      assert.isNotEmpty(smsNotificationsToCustomer);
      const smsNotificationsToVendor = await Notification.find({
        recipient: order.vendor.phoneNumber,
        type: 'sms',
      });
      assert.isNotEmpty(smsNotificationsToVendor);
      return;
    },
  };
};

describe(`${
  MARK_ORDER_AS_PAID(fixtures).ACTION_NAME
} successfully flag order as paid`, () => {
  it('flags order as paid', async () => {
    try {
      const dummyPayId = 'dummy_pay_id_' + uuidv4();
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
      expect(newOrder.completedFlag).to.equal('');
      expect(newOrder.paymentStatus).to.equal('paid');
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('can flag order as payment failed', async () => {
    try {
      const dummyPayId = 'dummy_pay_id_failure_' + uuidv4();
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
      expect(newOrder.completedFlag).to.equal('');
      expect(newOrder.paymentStatus).to.equal('failed');
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${
  MARK_ORDER_AS_REFUNDED_SUCCESS(fixtures).ACTION_NAME
} successfully flag order as refunded`, () => {
  it('can flag order as refund succeeded and notifies users, vendors and vegisupport', async () => {
    try {
      const dummyPayId = 'dummy_pay_id_failure_' + uuidv4();
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
          status: 'success',
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      const newOrder = await Order.findOne({
        publicId: parentOrder.publicId,
      });
      expect(newOrder.completedFlag).to.equal(
        'refunded',
        util.inspect(newOrder, { depth: null })
      );
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('can notify users, vendors and vegisupport when a refund fails', async () => {
    try {
      const dummyPayId = 'dummy_pay_id_failure_' + uuidv4();
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
      expect(newOrder.completedFlag).to.not.equal('refunded');
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
