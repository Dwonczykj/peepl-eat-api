// test/integration/controllers/admin/create-product.test.js
const { assert, expect } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require('util');
const moment = require('moment/moment');
require('ts-node/register');
const { fixtures } = require('../../../../scripts/build_db');
const { getNextWeekday } = require('../../../utils');

const { v4: uuidv4 } = require('uuid');

const {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
} = require('./defaultOrder');

const CUSTOMER_CAN_UPDATE_ITEMS_ON_PAID_ORDER = (fixtures) => {
  return {
    useAccount: 'TEST_USER',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'customer-update-paid-order',
    sendData: {
      orderId: null,
      customerWalletAddress: null,
      retainItems: [],
      removeItems: [],
      refundRequestGBPx: 5100,
      refundRequestPPL: 0,
    },
    expectResponse: {
      orderId: null, //newOrderId
    },
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      const parentOrder = await Order.findOne({
        publicId: requestPayload.orderId,
        // parentOrder: null,
      }).populate('vendor');

      assert.isNotNull(parentOrder);
      assert.isNotEmpty(parentOrder);
      assert.isNull(parentOrder.parentOrder);

      const childOrder = await Order.findOne({
        paymentIntentId: parentOrder.paymentIntentId,
        parentOrder: parentOrder.id,
      }).populate('vendor');
      assert.isNotNull(childOrder);
      assert.isNotEmpty(childOrder);

      const refunds = await Refund.find({
        paymentIntentId: parentOrder.paymentIntentId,
      });
      for (const refund of refunds) {
        expect(refund.refundStatus).to.equal(
          'unpaid',
          `Refund Status not set correctly on: ${util.inspect(refund, {
            depth: null,
          })}`
        );
      }

      const orders = await Order.find({
        paymentIntentId: parentOrder.paymentIntentId,
      });
      assert.isArray(orders);
      expect(orders).to.have.lengthOf(
        2,
        `Expect number of orders with paymentIntentId of ${requestPayload.orderId} to be 2, got ${orders.length} orders`
      );

      const smsNotifications = await Notification.find({
        recipient: parentOrder.vendor.phoneNumber,
        type: 'sms',
      });
      assert.isNotEmpty(smsNotifications);
      return;
    },
  };
};

const USER_UPDATED_PAID_ORDER_SUCCEEDED = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'orders',
    ACTION_NAME: 'peepl-pay-update-paid-order-webhook',
    sendData: {
      publicId: null,
      metadata: {
        orderId: 1,
        paymentIntentId: '',
        customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      },
      status: 'success',
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      const parentOrder = await Order.findOne({
        paymentIntentId: requestPayload.publicId,
        parentOrder: null,
      }).populate('vendor');

      assert.isNotNull(parentOrder);
      assert.isNotEmpty(parentOrder);
      assert.isNull(parentOrder.parentOrder);

      const childOrder = await Order.findOne({
        paymentIntentId: parentOrder.paymentIntentId,
        parentOrder: parentOrder.id,
      }).populate('vendor');
      assert.isNotNull(childOrder);
      assert.isNotEmpty(childOrder);

      const refunds = await Refund.find({
        paymentIntentId: requestPayload.publicId,
      });
      for (const refund of refunds){
        expect(refund.refundStatus).to.equal('paid', `Refund Status not set correctly on: ${util.inspect(refund, {depth: null})}`);
      }
      const firebaseNotifications = await Notification.find({
        recipient: 'order-' + childOrder.publicId,
        type: 'push'
      });
      assert.isNotEmpty(firebaseNotifications);
      const smsNotifications = await Notification.find({
        recipient: childOrder.deliveryPhoneNumber,
        type: 'sms',
      });
      assert.isNotEmpty(smsNotifications);
      return;
    },
  };
};
const USER_UPDATED_PAID_ORDER_FAILS_WHEN_ORDER_NOT_UPDATED = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'orders',
    ACTION_NAME: 'peepl-pay-update-paid-order-webhook',
    sendData: {
      publicId: null,
      metadata: {
        orderId: 1,
        paymentIntentId: '',
        customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      },
      status: 'success',
    },
    expectResponse: {},
    expectStatusCode: 404,
    expectResponseCb: async (response, requestPayload) => {
      const parentOrder = await Order.findOne({
        paymentIntentId: requestPayload.publicId,
        // parentOrder: null,
      }).populate('vendor');

      assert.isNotNull(parentOrder);
      assert.isNotEmpty(parentOrder);
      assert.isNull(parentOrder.parentOrder);

      const childOrder = await Order.findOne({
        paymentIntentId: parentOrder.paymentIntentId,
        parentOrder: parentOrder.id,
      });
      assert.isUndefined(childOrder);
      return;
    },
  };
};
const UPDATED_PAID_ORDER_FAILED = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'post',
    ACTION_PATH: 'orders',
    ACTION_NAME: 'peepl-pay-update-paid-order-webhook',
    sendData: {
      publicId: null,
      metadata: {
        orderId: 1,
        paymentIntentId: '',
        customerWalletAddress: '0x41190Dd82D43129C26955063fa2854350e14554B',
      },
      status: 'failed',
    },
    expectResponse: {},
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      const parentOrder = await Order.findOne({
        paymentIntentId: requestPayload.publicId,
        parentOrder: null,
      }).populate('vendor');

      assert.isNotNull(parentOrder);
      assert.isNotEmpty(parentOrder);
      assert.isNull(parentOrder.parentOrder);

      const childOrder = await Order.findOne({
        paymentIntentId: parentOrder.paymentIntentId,
        parentOrder: parentOrder.id,
      }).populate('vendor');
      assert.isNotNull(childOrder);
      assert.isNotEmpty(childOrder);

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
      const firebaseNotifications = await Notification.find({
        recipient: 'order-' + childOrder.publicId,
        type: 'push',
      });
      assert.isNotEmpty(firebaseNotifications);

      const smsNotifications = await Notification.find({
        recipient: childOrder.deliveryPhoneNumber,
        type: 'sms',
      });
      assert.isNotEmpty(smsNotifications);
      return;
    },
  };
};


describe(`${CUSTOMER_CAN_UPDATE_ITEMS_ON_PAID_ORDER(fixtures).ACTION_NAME}()`, () => {
  it('users can successfully UPDATE ITEMS on an order after getting a partial fulfillment back from a vendor', async () => {
    try {
      const parentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          paymentStatus: 'paid',
          paymentIntentId: 'dummy_payint_id_' + uuidv4(),
          completedFlag: '',
          parentOrder: null,
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      const hats = new HttpAuthTestSenderOrder(
        CUSTOMER_CAN_UPDATE_ITEMS_ON_PAID_ORDER(fixtures)
      );
      const response = await hats.makeAuthCallWith(
        {
          orderId: parentOrder.publicId,
          customerWalletAddress: parentOrder.customerWalletAddress,
          retainItems: [1, 2, 3],
          removeItems: [6, 8],
          refundRequestGBPx: 5425, //TODO what wasnt in the refundRequestPPL
          refundRequestPPL: 0, //TODO order.total before flat fees and stuff added, pull adam changes, * 5% (coln/delv)
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
      expect(response.body).to.have.property('orderId');
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});

describe(`${USER_UPDATED_PAID_ORDER_SUCCEEDED(fixtures).ACTION_NAME}()`, () => {
  it('PeeplPay Service can successfully send notifications when a payment succeeds for an order', async () => {
    try {
      const voidParentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          items: [1, 2, 3, 6, 8],
          total: 5425, //5300 + 125
        })
      ).fetch();
      const paidUpdatedOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: voidParentOrder.id,
          paymentIntentId: voidParentOrder.paymentIntentId,
          items: [1, 2, 3, 6],
          total: 3225,
        })
      ).fetch();
      await Refund.createEach([
        {
          paymentIntentId: paidUpdatedOrder.paymentIntentId,
          currency: sails.config.custom.vegiDigitalStableCurrencyTicker,
          amount: voidParentOrder.total - paidUpdatedOrder.total,
          recipientWalletAddress: paidUpdatedOrder.customerWalletAddress,
          requestedAt: Date.now(),
          refundStatus: 'unpaid',
        },
      ]);
      const hats = new HttpAuthTestSenderOrder(
        USER_UPDATED_PAID_ORDER_SUCCEEDED(fixtures)
      );
      console.log(`paymentIntentId: ${paidUpdatedOrder.paymentIntentId}`);
      const response = await hats.makeAuthCallWith(
        {
          publicId: paidUpdatedOrder.paymentIntentId,
          metadata: {
            orderId: paidUpdatedOrder.publicId,
            paymentIntentId: paidUpdatedOrder.paymentIntentId,
            customerWalletAddress: paidUpdatedOrder.customerWalletAddress,
          },
          status: 'success',
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('PeeplPay Service returns a 404 when the linked order has no', async () => {
    try {
      const paidOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          items: [1, 2, 3, 6, 8],
          total: 5425,
        })
      ).fetch();
      await Refund.createEach([
        {
          paymentIntentId: paidOrder.paymentIntentId,
          currency: sails.config.custom.vegiDigitalStableCurrencyTicker,
          amount: paidOrder.total,
          recipientWalletAddress: paidOrder.customerWalletAddress,
          requestedAt: Date.now(),
          refundStatus: 'unpaid',
        },
      ]);
      const hats = new HttpAuthTestSenderOrder(
        USER_UPDATED_PAID_ORDER_FAILS_WHEN_ORDER_NOT_UPDATED(fixtures)
      );
      console.log(`paymentIntentId: ${paidOrder.paymentIntentId}`);
      const response = await hats.makeAuthCallWith(
        {
          publicId: paidOrder.paymentIntentId,
          metadata: {
            orderId: paidOrder.publicId,
            paymentIntentId: paidOrder.paymentIntentId,
            customerWalletAddress: paidOrder.customerWalletAddress,
          },
          status: 'success',
        },
        []
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
  it('PeeplPay Service can successfully send notifications when a payment fails for an order', async () => {
    try {
      const voidParentOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: null,
          paymentIntentId: 'dummy_payment_intent_id_' + uuidv4(),
          items: [1, 2, 3, 6, 8],
          total: 5425, //5300 + 125
        })
      ).fetch();
      const paidUpdatedOrder = await Order.create(
        DEFAULT_NEW_ORDER_OBJECT(fixtures, {
          parentOrder: voidParentOrder.id,
          paymentIntentId: voidParentOrder.paymentIntentId,
          items: [1, 2, 3, 6],
          total: 3225,
        })
      ).fetch();
      await Refund.createEach([
        {
          paymentIntentId: paidUpdatedOrder.paymentIntentId,
          currency: sails.config.custom.vegiDigitalStableCurrencyTicker,
          amount: voidParentOrder.total - paidUpdatedOrder.total,
          recipientWalletAddress: paidUpdatedOrder.customerWalletAddress,
          requestedAt: Date.now(),
          refundStatus: 'unpaid',
        },
      ]);
      const hats = new HttpAuthTestSenderOrder(
        UPDATED_PAID_ORDER_FAILED(fixtures)
      );
      console.log(`paymentIntentId: ${paidUpdatedOrder.paymentIntentId}`);
      const response = await hats.makeAuthCallWith(
        {
          publicId: paidUpdatedOrder.paymentIntentId,
          metadata: {
            orderId: paidUpdatedOrder.publicId,
            paymentIntentId: paidUpdatedOrder.paymentIntentId,
            customerWalletAddress: paidUpdatedOrder.customerWalletAddress,
          },
          status: 'failed',
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
