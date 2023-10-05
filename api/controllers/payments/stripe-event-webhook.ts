/* eslint-disable camelcase */
import stripeFactory from '../../../scripts/load_stripe';
import Stripe from 'stripe';
import _ from 'lodash';
const util = require('util');
import axios from 'axios';
import moment from 'moment';
import { SailsModelType, sailsVegi } from '../../interfaces/iSails';
import { AccountType, DiscountType, OrderType, SailsActionDefnType, SailsDBError, TransactionType, datetimeStrFormatExact, datetimeStrFormatExactForSQLTIMESTAMP, has } from '../../../scripts/utils';
import {
  generateCorrelationId,
  mintTokensToAddress,
} from '../../../fuse/fuseApi';
import { Currency } from '../../../api/interfaces/peeplPay';

declare var sails: sailsVegi;
declare var Order: SailsModelType<OrderType>;
declare var Discount: SailsModelType<DiscountType>;
declare var Account: SailsModelType<AccountType>;
declare var Transaction: SailsModelType<TransactionType>;


interface Request {
  id: string;
  idempotency_key: string;
}

interface Address {
  city: string;
  country: string;
  line1: string;
  line2?: any;
  postal_code: string;
  state: string;
}

interface Shipping {
  address: Address;
  carrier?: any;
  name: string;
  phone?: any;
  tracking_number?: any;
}

interface Card {
  installments?: any;
  mandate_options?: any;
  network?: any;
  request_three_d_secure: string;
}

interface Paymentmethodoptions {
  card: Card;
}
interface Metadata {
  senderWalletAddress: string;
  recipientWalletAddress: string;
  webhookAddress: string;
  currency: string;
  accountId: string;
  walletAddress: string;
  orderId: string;
  amount: string;
}

interface Tip {}
interface Amountdetails {
  tip: Tip;
}

interface Object {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_details: Amountdetails;
  amount_received: number;
  application?: any;
  application_fee_amount?: any;
  automatic_payment_methods?: any;
  canceled_at?: any;
  cancellation_reason?: any;
  capture_method: string;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string;
  description?: any;
  invoice?: any;
  last_payment_error?: any;
  latest_charge?: any;
  livemode: boolean;
  metadata: Metadata;
  next_action?: any;
  on_behalf_of?: any;
  payment_method?: any;
  payment_method_options: Paymentmethodoptions;
  payment_method_types: string[];
  processing?: any;
  receipt_email?: any;
  review?: any;
  setup_future_usage?: any;
  shipping: Shipping;
  source?: any;
  statement_descriptor: string;
  statement_descriptor_suffix?: any;
  status: string;
  transfer_data?: any;
  transfer_group?: any;
}

interface Data {
  object: Object;
}

export interface StripeWebHookInput {
  data: Data;
  type: string;
  id: string;
  api_version: string;
  created: number;
  object: string;
  livemode: boolean;
  pending_webhooks: number;
  request: Request;
  account: string | undefined;
}

export type StripeEventWebhookInputs = Stripe.Event;

export type StripeEventWebhookResponse = undefined | false;

export type StripeEventWebhookExits = {
  success: (unusedData?: StripeEventWebhookResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const handleStripePaymentIntentEvent = async (
  dataObj: Stripe.Event['data']['object'],
  eventType: Stripe.Event['type']
) => {

};

const sendPushNotificationForOrder = async (
  order: OrderType,
  dataObj: Stripe.Event.Data.Object,
) => {
  try {
    if (order.firebaseRegistrationToken) {
      sails.log.warn(
        `Firebase notifications on registration tokens (i.e. "${order.firebaseRegistrationToken}" for order[${order.id}]) are  not currently working...`
      );
      await sails.helpers.sendFirebaseNotification.with({
        topicBackup: `order-${order.publicId}`,
        token: order.firebaseRegistrationToken,
        title: 'Payment success',
        body: '✅ Payment on vegi succeeded',
        data: {
          orderId: `${order.id}`,
          stripeData: dataObj,
        },
      });
    } else {
      await sails.helpers.broadcastFirebaseNotificationForTopic.with({
        topic: `order-${order.publicId}`,
        title: `Payment success`,
        body: '✅ Payment on vegi succeeded',
        data: {
          orderId: `${order.id}`,
          stripeData: dataObj,
        },
      });
    }
  } catch (_error) {
    const error: SailsDBError = _error;
    sails.log.error(`Unable to sendPushNotificationForOrder from StripeEventWebhook with error: ${error.details}`);
  }
};

const addDiscountsTrx = async (
  order: OrderType,
) => {
  try {
    if (order.discounts && order.discounts.length > 0) {
      const addTxFn = async (discount: DiscountType) => {
        if (discount.discountType === 'fixed') {
          await Transaction.create({
            amount: discount.value,
            currency: discount.currency,
            discount: discount.id,
            order: order.id,
            payer: order.customerWalletAddress,
            receiver: order.vendor.walletAddress,
            timestamp: moment().format(datetimeStrFormatExactForSQLTIMESTAMP),
            status: 'succeeded',
            remoteJobId: null,
          });
          await Discount.update({
            id: discount.id,
          }).set({
            timesUsed: discount.timesUsed + 1,
            isEnabled: false,
          });
          await Discount.addToCollection(discount.id, 'orders').members([
            order.id,
          ]);
          return;
        } else if (discount.discountType === 'percentage') {
          let amount = (discount.value / 100) * order.subtotal;
          if (discount.value > 100) {
            sails.log.error(
              `Cant add percentage discount to order with value > 100% for discount with code: ${discount.code}`
            );
            return;
          } else if (discount.value < 0) {
            sails.log.error(
              `Cant add percentage discount to order with value < 0% for discount with code: ${discount.code}`
            );
            return;
          } else {
            sails.log.info(
              `Percentage discount of ${discount.value}% applied to order subtotal gives discounted amount of ${amount} [${discount.currency}]`
            );
          }

          const toCurrency = order.currency || Currency.GBPx;
          if (toCurrency !== discount.currency) {
            amount = await sails.helpers.convertCurrencyAmount.with({
              amount: amount,
              fromCurrency: discount.currency,
              toCurrency: toCurrency,
            });
          }
          await Transaction.create({
            amount: amount,
            currency: toCurrency,
            discount: discount.id,
            order: order.id,
            payer: order.customerWalletAddress,
            receiver: order.vendor.walletAddress,
            timestamp: moment().format(datetimeStrFormatExactForSQLTIMESTAMP),
            status: 'succeeded',
            remoteJobId: null,
          });
          await Discount.update({
            id: discount.id,
          }).set({
            timesUsed: discount.timesUsed + 1,
            isEnabled:
              discount.isEnabled && discount.timesUsed + 1 < discount.maxUses,
          });
          await Discount.addToCollection(discount.id, 'orders').members([
            order.id,
          ]);
          return;
        } else {
          sails.log.warn(
            `Unable to calculate discounts in stripe-event-webhook for discounts with type: "${discount.discountType}"`
          );
        }
      };
      await Promise.all(order.discounts.map((discount) => addTxFn(discount)));
    }
    return null;
  } catch (error) {
    sails.log.error(
      `stripe-event-webhook errored when updating discounts on order: "${order.publicId}" with error: ${error}`
    );
    sails.log.error(`${error}`);
    return error;
  }
};

const setOrderToPaid = async (

  order: OrderType,
) => {
  try {
    sails.log.info(
      `Set order with id: "${order.id}" to paid for stripe payment-intent event`
    );
    // const unixtime = Date.now();
    await Order.update({
      id: order.id,
    }).set({
      paymentStatus: 'paid',
      paidDateTime: Date.now(),
    });
    return null;
  } catch (_error) {
    const error: SailsDBError = _error;
    sails.log.error(
      `stripe-event-webhook errored when updating order with publicId: "${order.publicId}" to "paymentStatus:paid": ${error}`
    );
    sails.log.error(`${error}`);
    // return exits.error(`Failed to set order to "paid" with error: ${error}`);
    return error;
  }
};

const sendOrderPaidNotifications = async (
  order: OrderType,
) => {
  await sails.helpers.sendSlackNotification.with({ order: order });
  await sails.helpers.sendSmsNotification.with({
    to: order.vendor.phoneNumber,
    // body: `You have received a new order from vegi for delivery between ${order.fulfilmentSlotFrom} and ${order.fulfilmentSlotTo}. ` +
    // `To accept or decline: ' + sails.config.custom.baseUrl + '/admin/approve-order/' + order.publicId,
    body: `[from vegi]
New order alert! 🚨
Order details ${sails.config.custom.baseUrl}/admin/approve-order/${order.publicId}
Please accept/decline ASAP.
Delivery/Collection on ${order.fulfilmentSlotFrom} - ${order.fulfilmentSlotTo}`,
    data: {
      orderId: order.id,
    },
  });
  await sails.helpers.sendSmsNotification.with({
    to: order.deliveryPhoneNumber,
    body: `Order accepted! Details of your order can be found in the My Orders section of the vegi app. Thank you!`,
    data: {
      orderId: order.id,
    },
  });
};

/**
 * The function `updateOrderPaymentStatus` updates the payment status of an order based on the payment
 * status received from a webhook, and performs additional actions based on the payment status.
 * @param paymentStatus - The payment status of the order. It can be one of the following values:
 * 'paid', 'unpaid', or 'failed'.
 * @param paymentIntent - The `paymentIntent` parameter is an object that represents a Stripe
 * PaymentIntent. It contains information about the payment, such as the amount, currency, and status.
 * @param {OrderType} order - The `order` parameter is an object that represents an order. It contains
 * information such as the order ID, vendor details, delivery phone number, fulfillment slot, and
 * payment status.
 * @param {StripeWebHookInput} inputs - The `inputs` parameter is an object that contains the input
 * data received from the Stripe webhook event. It is of type `StripeWebHookInput`.
 * @param {StripeEventWebhookExits} exits - The `exits` parameter is an object that contains different
 * exit functions that can be called to handle different scenarios or outcomes of the function. These
 * exit functions are typically used to return a response or error message to the caller of the
 * function.
 * @returns a promise that resolves to either a success or an error.
 */
const updateOrderPaymentStatus = async (
  paymentStatus: OrderType['paymentStatus'],
  order: OrderType,
  inputs: StripeWebHookInput,
  exits: StripeEventWebhookExits,
) => {
  if (!['paid', 'unpaid', 'failed'].includes(paymentStatus)) {
    sails.log.warn(
      `stripe-event-webhook received a vegi paymentStatus enum: PaymentStatus.[${paymentStatus}]. This is not handled!`
    );
    paymentStatus = 'unpaid';
  }

  await setOrderToPaid(order);
  
  order = await Order.findOne(order.id).populate('vendor');

  try {
    if (paymentStatus === 'paid') {
      await sendOrderPaidNotifications(order);

      // * turn into transaction if supported, then fo an order find after to check the updated order and TX
      const setDiscountsForOrderError = await addDiscountsTrx(order);
      if(setDiscountsForOrderError){
        return exits.error(
          `stripe-event-webhook errored when updating discounts on order: "${order.publicId}" with error: ${setDiscountsForOrderError}`
        );
      }
    } else if (paymentStatus === 'unpaid') {
      sails.log.verbose(
        `Stripe event webhook called for "unpaid" Order[${order.id}] for ${inputs.type}`
      );
    } else if (paymentStatus === 'failed') {
      await sails.helpers.sendSlackNotification.with({ order: order });
      await sails.helpers.sendSmsNotification.with({
        to: order.deliveryPhoneNumber,
        body:
          `Your payment for a recent order to ${order.vendor.name} failed. Order was scheduled between ` +
          order.fulfilmentSlotFrom +
          ' and ' +
          order.fulfilmentSlotTo +
          '. Please review your payment in the vegi app.',
        data: {
          orderId: order.id,
        },
      });
    } else {
      sails.log.warn(
        `Payment for recent order[${
          order.id
        }] hit the stripe-event-webhook with paymentStatus of ${
          order.paymentStatus
        } and contained inputs: ${util.inspect(inputs, {
          depth: null,
        })}`
      );
    }
    return exits.success();
  } catch (error) {
    sails.log.error(
      `stripe-event-webhook errored sending sms notification to vendor for paid order: ${error}`
    );
    return exits.error(
      `stripe-event-webhook errored sending sms notification to vendor for paid order: ${error}`
    );
  }
  
};

const handleStripeRefundEvent = async (
  order: OrderType,
  dataObj: Stripe.Event['data']['object'],
  eventType: Stripe.Event['type'],
  exits: StripeEventWebhookExits,
) => {
  if (eventType === 'refund.created') {
    // paymentStatus = 'refunded';
    if (order.firebaseRegistrationToken) {
      await sails.helpers.sendFirebaseNotification.with({
        topicBackup: `order-${order.publicId}`,
        token: order.firebaseRegistrationToken,
        title: 'Payment refunded',
        body: `Order[${order.id}] for ${order.total} has been refunded.`,
        data: {
          orderId: `${order.id}`,
          stripeData: dataObj,
        },
      });
    }

    await sails.helpers.broadcastFirebaseNotificationForTopic.with({
      topic: `order-${order.publicId}`,
      title: 'Payment refunded',
      body: `Order[${order.id}] for ${order.total} has been refunded.`,
      data: {
        orderId: `${order.id}`,
      },
    });

    try {
      await Order.updateOne(order.id).set({
        refundDateTime: Date.now(),
        paymentStatus: 'refunded',
        completedFlag: 'refunded',
        // refundDateTime: moment().format(datetimeStrFormatExact);
      });
    } catch (error) {
      sails.log.error(
        `Failed to update refund status on order: [${order.id}] in stripe-event-webhook with error: ${error}`
      );
    }
  }
  return exits.success();
};

const handleStripeCustomerEvent = async (
  dataObj: Stripe.Event['data']['object'],
  eventType: Stripe.Event['type'],
  exits: StripeEventWebhookExits,
) => {
  // Check that the customerId matches the accountId.customerId on the order via
  // order.customerWalletAddress -> account.walletAddress -> account.stripeCustomerId
  const customer: Stripe.Customer = dataObj as any;
  const customerId = customer.id;
  const accounts = await Account.find({
    stripeAccountId: customerId,
  });
  if (!accounts || accounts.length < 1) {
    const e = Error(
      `Stripe Event Webook for "${eventType}" webhook was unable to locate an stripe customer with id: : "${customerId}" with a matching Account record on vegi.`
    );
    sails.log.warn(e);
  }
  return exits.success();
};

const _recordUnhandledStripeEvent = async (
  dataObj: Stripe.Event['data']['object'],
  eventType: Stripe.Event['type'],
  exits: StripeEventWebhookExits,
) => {
  // Handle the event
  switch (eventType) {
    case 'checkout.session.async_payment_failed':
      {
        const checkoutSessionAsyncPaymentFailed = dataObj;
        sails.log.info(
          `${checkoutSessionAsyncPaymentFailed} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event checkout.session.async_payment_failed
      break;
    case 'checkout.session.async_payment_succeeded':
      {
        const checkoutSessionAsyncPaymentSucceeded = dataObj;
        sails.log.info(
          `${checkoutSessionAsyncPaymentSucceeded} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      break;
    case 'checkout.session.completed':
      {
        const checkoutSessionCompleted = dataObj;
        sails.log.info(
          `${checkoutSessionCompleted} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event checkout.session.completed
      break;
    case 'checkout.session.expired':
      {
        const checkoutSessionExpired = dataObj;
        sails.log.info(
          `${checkoutSessionExpired} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event checkout.session.expired
      break;
    case 'payment_intent.amount_capturable_updated':
      {
        const paymentIntentAmountCapturableUpdated = dataObj;
        sails.log.info(
          `${paymentIntentAmountCapturableUpdated} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      break;
    case 'payment_intent.canceled':
      {
        const paymentIntentCanceled = dataObj;
        sails.log.info(
          `${paymentIntentCanceled} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.canceled
      break;
    case 'payment_intent.created':
      {
        const paymentIntentCreated = dataObj;
        sails.log.info(
          `${paymentIntentCreated} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.created
      break;
    case 'payment_intent.partially_funded':
      {
        const paymentIntentPartiallyFunded = dataObj;
        sails.log.info(
          `${paymentIntentPartiallyFunded} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.partially_funded
      break;
    case 'payment_intent.payment_failed':
      {
        const paymentIntentPaymentFailed = dataObj;
        sails.log.info(
          `${paymentIntentPaymentFailed} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.processing':
      {
        const paymentIntentProcessing = dataObj;
        sails.log.info(
          `${paymentIntentProcessing} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case 'payment_intent.requires_action':
      {
        const paymentIntentRequiresAction = dataObj;
        sails.log.info(
          `${paymentIntentRequiresAction} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.requires_action
      break;
    case 'payment_intent.succeeded':
      {
        const paymentIntentSucceeded = dataObj;
        sails.log.info(
          `${paymentIntentSucceeded} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case 'topup.canceled':
      {
        const topupCanceled = dataObj;
        sails.log.info(
          `${topupCanceled} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event topup.canceled
      break;
    case 'topup.created':
      {
        const topupCreated = dataObj;
        sails.log.info(
          `${topupCreated} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event topup.created
      break;
    case 'topup.failed':
      {
        const topupFailed = dataObj;
        sails.log.info(
          `${topupFailed} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event topup.failed
      break;
    case 'topup.reversed':
      {
        const topupReversed = dataObj;
        sails.log.info(
          `${topupReversed} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event topup.reversed
      break;
    case 'topup.succeeded':
      {
        const topupSucceeded = dataObj;
        sails.log.info(
          `${topupSucceeded} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event topup.succeeded
      break;
    case 'transfer.created':
      {
        const transferCreated = dataObj;
        sails.log.info(
          `${transferCreated} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event transfer.created
      break;
    case 'transfer.reversed':
      {
        const transferReversed = dataObj;
        sails.log.info(
          `${transferReversed} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event transfer.reversed
      break;
    case 'transfer.updated':
      {
        const transferUpdated = dataObj;
        sails.log.info(
          `${transferUpdated} event occured in 'stripe-event-webhook' endpoint`
        );
      }
      // Then define and call a function to handle the event transfer.updated
      break;
    // ... handle other event types
    default:
      sails.log.info(`Unhandled event type ${eventType}`);
  }
  return exits.success();
};



export const getOrderByPaymentIntentIdSafe = async (params: {
  paymentIntentId: string;
  eventType: Stripe.Event['type'];
  dataObj: Stripe.Event.Data.Object;
}) => {
  const { paymentIntentId, dataObj, eventType } = params;
  let orders = await Order.find({
    paymentIntentId: paymentIntentId,
  }).populate('vendor&discounts');
  if (!orders || orders.length < 1) {
    const util = require('util');
    if (dataObj['metadata'] && dataObj['metadata']['orderId']) {
      orders = await Order.find({
        id: Number.parseInt(dataObj['metadata']['orderId']),
      }).populate('vendor&discounts');
    }
    if (!orders || orders.length < 1) {
      const e = Error(
        `Stripe Event Webhook for "${eventType}" webhook was unable to locate an order with matching payment intent: "${paymentIntentId}". The stripe event contained meta: ${util.inspect(
          dataObj,
          { depth: null }
        )}`
      );
      sails.log.error(`${e}`);
      // return exits.success();
      return null;
    }
    let order = orders[0];
    const e = Error(
      `Stripe Event Webhook for "${eventType}" webhook located an order with different payment intent: "${
        order.paymentIntentId
      }" vs the passed paymentIntentId from stripe: "${paymentIntentId}". The stripe event contained meta: ${util.inspect(
        dataObj,
        { depth: null }
      )}`
    );
    sails.log.error(`${e}`);
    // return exits.success();
    return null;
  }
  let order = orders[0];
  return order;
};

// ~ https://stripe.com/docs/webhooks
// todo: 4. Test that your webhook endpoint is working properly using the Stripe CLI.
// todo: 5. Deploy your webhook endpoint so it's a publicly accessible HTTPS URL.
// todo: 6. Register your publicly accessible HTTPS URL in the Stripe dashboard. (https://stripe.com/docs/webhooks/go-live)
const _exports: SailsActionDefnType<
  StripeWebHookInput,
  StripeEventWebhookResponse,
  StripeEventWebhookExits
> = {
  friendlyName: 'StripeEventWebhook',

  inputs: {
    data: {
      type: 'ref',
      required: false,
    },
    type: {
      type: 'string',
      required: false,
    },
    id: {
      type: 'string',
      required: false,
    },
    api_version: {
      type: 'string',
      required: false,
    },
    created: {
      type: 'number',
      required: false,
    },
    object: {
      type: 'string',
      required: false,
    },
    livemode: {
      type: 'boolean',
      required: false,
    },
    pending_webhooks: {
      type: 'number',
      required: false,
    },
    account: {
      type: 'string',
      required: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    issue: {
      statusCode: 403,
    },
    badRequest: {
      responseType: 'badRequest',
    },
    error: {
      statusCode: 500,
    },
  },

  fn: async function (
    inputs: StripeWebHookInput,
    // inputs: StripeEventWebhookInputs,
    exits: StripeEventWebhookExits
  ) {
    let data: Stripe.Event['data'];
    let dataObj: Stripe.Event['data']['object'];
    let eventType: Stripe.Event['type'];

    try {
      // * Construct Stipe Event Data Object
      const stripe = await stripeFactory(this.req.session.userId);
      if (Object.keys(sails.config.custom).includes('stripeWebhookSecret')) {
        let event: Stripe.Event;
        const signature = this.req.headers['stripe-signature'];
        try {
          event = stripe.webhooks.constructEvent(
            this.req.rawBody, // ! inputs
            signature,
            sails.config.custom['stripeWebhookSecret']
          );
        } catch (err) {
          sails.log.error({ err });
          return exits.error(err);
        }
        data = event.data;
        dataObj = event.data.object;
        eventType = event.type;
      } else {
        data = inputs.data;
        dataObj = inputs.data.object;
        eventType = inputs.type;
      }

      // * Handle PaymentIntent or Refund or Customer Events ONLY
      if (
        eventType.startsWith('payment_intent') &&
        dataObj['object'] === 'payment_intent'
      ) {
        const paymentIntent = dataObj as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;
        let order = await getOrderByPaymentIntentIdSafe({
          dataObj: dataObj,
          paymentIntentId: paymentIntentId,
          eventType: eventType,
        });
        if (!order) {
          return exits.success();
        }
        sails.log.info(
          `Stripe webhook called for order with public id: "${order.publicId}"`
        );
        sails.log.info('PaymentIntent event captured!');
        // * if (dataObj.charges.data[0].metadata.walletAddress) for normal payments we pass receiverWalletAddress and senderWalletAddress
        // const { amount, walletAddress: toAddress } = _.get(
        //   dataObj,
        //   ['charges', 'data', '0', 'metadata'], // * dataObj.charges.data[0].metadata.amount, dataObj.charges.data[0].metadata.walletAddress
        //   {}
        // );
        const { amount, walletAddress: toAddress } = dataObj['metadata'];

        let paymentStatus: OrderType['paymentStatus'];
        if (eventType === 'payment_intent.succeeded') {
          // * SUCCESSFUL PAYMENT
          sails.log.info(
            `💰 Stripe card payment succeeded for order: "${order.publicId}"`
          );
          paymentStatus = 'paid';
          
          await sendPushNotificationForOrder(
            order, 
            dataObj,
          );

          if (toAddress) {
            // Crypto Transaction:...
            sails.log.info(`Minting ${amount} to "${toAddress}" 💰!`);
            const correlationId = generateCorrelationId();
            try {
              await mintTokensToAddress({
                toAddress,
                amount: Number.parseFloat(amount.toString()).toString(),
                correlationId,
                orderId: order.id,
              });
            } catch (error) {
              sails.log.error(
                `Unable to mint ${amount} Tokens to "${toAddress}" with error: ${error}`
              );
            }
          }
        } else if (eventType === 'payment_intent.processing') {
          // * PROCESSING PAYMENT
          sails.log.info(
            '🧧 Stripe webhook: Successfully created payment intent for customer'
          );
          paymentStatus = 'unpaid';
          // do nothing for now...
        } else if (eventType === 'payment_intent.payment_failed') {
          // * FAILED PAYMENT
          sails.log.info('❌ Stripe webhook: Payment failed.');
          paymentStatus = 'failed';
          if (order.firebaseRegistrationToken) {
            await sails.helpers.sendFirebaseNotification.with({
              topicBackup: `order-${order.publicId}`,
              token: order.firebaseRegistrationToken,
              title: 'Payment failed',
              body: '❌ Payment on vegi failed',
              data: {
                orderId: `${order.id}`,
                stripeData: dataObj,
              },
            });
          }
          await sails.helpers.broadcastFirebaseNotificationForTopic.with({
            topic: `order-${order.publicId}`,
            title: 'Payment failed',
            body: '❌ Payment on vegi failed',
            data: {
              orderId: `${order.id}`,
              stripeData: dataObj,
            },
          });
        } else {
          sails.log.info(`Stripe webhook received: ["${eventType}"]`);
          paymentStatus = 'unpaid';
        }
        // * UPDATE ORDER PAYMENT STATUS
        return await updateOrderPaymentStatus(
          paymentStatus,
          order,
          inputs,
          exits,
        );
      } else if (
        eventType.startsWith('refund') &&
        dataObj['object'] === 'refund'
      ) {
        // * REFUNDS
        const refundDataObj = dataObj as Stripe.Refund;
        const order = await getOrderByPaymentIntentIdSafe({
          dataObj: dataObj,
          paymentIntentId:
            typeof refundDataObj.payment_intent === 'string'
              ? refundDataObj.payment_intent
              : refundDataObj.payment_intent.id,
          eventType: eventType,
        });
        if (!order) {
          return exits.success();
        }
        return await handleStripeRefundEvent(order, dataObj, eventType, exits);
      } else if (
        eventType.startsWith('customer') &&
        dataObj['object'] === 'customer'
      ) {
        // * CUSTOMERS
        return await handleStripeCustomerEvent(dataObj, eventType, exits);
      } else {
        sails.log.info(`Ignoring Stripe Webhook event: ["${eventType}"]`);
        return await _recordUnhandledStripeEvent(dataObj, eventType, exits);
      }
    } catch (error) {
      return exits.error(error);
    }
  },
};

module.exports = _exports;
