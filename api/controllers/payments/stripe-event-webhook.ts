/* eslint-disable camelcase */
import stripe from '../../../scripts/load_stripe';
import Stripe from 'stripe';
import _ from 'lodash';
const util = require('util');
import axios from 'axios';
import moment from 'moment';
import { SailsModelType, sailsVegi } from '../../interfaces/iSails';
import { AccountType, DiscountType, OrderType, SailsActionDefnType, TransactionType, datetimeStrFormatExactForSQLTIMESTAMP } from '../../../scripts/utils';
import {
  generateCorrelationId,
  mintTokensAndSendToken,
} from '../../../fuse/fuseApi';
import { Currency } from '../../../api/interfaces/peeplPay';

declare var sails: sailsVegi;
declare var Order: SailsModelType<OrderType>;
declare var Discount: SailsModelType<DiscountType>;
declare var Account: SailsModelType<AccountType>;
declare var Transaction: SailsModelType<TransactionType>;

export type StripeEventWebhookInputs = Stripe.Event;

export type StripeEventWebhookResponse = undefined | false;

export type StripeEventWebhookExits = {
  success: (unusedData?: StripeEventWebhookResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

// ~ https://stripe.com/docs/webhooks
// todo: 4. Test that your webhook endpoint is working properly using the Stripe CLI.
// todo: 5. Deploy your webhook endpoint so it's a publicly accessible HTTPS URL.
// todo: 6. Register your publicly accessible HTTPS URL in the Stripe dashboard. (https://stripe.com/docs/webhooks/go-live)
const _exports: SailsActionDefnType<
  StripeEventWebhookInputs,
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
    inputs: StripeEventWebhookInputs,
    exits: StripeEventWebhookExits
  ) {
    let data: Stripe.Event['data'];
    let dataObj: Stripe.Event['data']['object'];
    let eventType: Stripe.Event['type'];

    try {
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
  
      if (eventType.startsWith('payment_intent') && dataObj['object'] === "payment_intent") {
        const paymentIntent:Stripe.PaymentIntent = dataObj as any;
        const paymentIntentId = paymentIntent.id;
        const orders = await Order.find({
          paymentIntentId: paymentIntentId,
        }).populate('vendor&discounts');
        if (!orders || orders.length < 1) {
          const util = require('util');
          const e = Error(
            `Stripe Event Webhook for "${eventType}" webhook was unable to locate an order with matching payment intent: "${paymentIntentId}". The stripe event contained meta: ${util.inspect(dataObj,{depth:null,})}`
          );
          sails.log.error(e);
          return exits.error(e);
        }
        let order = orders[0];
        sails.log(`Stripe webhook called for order with public id: "${order.publicId}"`);
  
        
        sails.log('PaymentIntent event captured!');
        const { amount, walletAddress: toAddress } = _.get(
          dataObj,
          ['charges', 'data', '0', 'metadata'],
          {}
        );
        if (toAddress) {
          // Crypto Transaction:...
          sails.log(`Minting ${amount} ${toAddress} 💰!`);
          const correlationId = generateCorrelationId();
          await mintTokensAndSendToken({
            correlationId,
            toAddress,
            amount: amount / 100,
          });
        } else {
          let paymentStatus: OrderType['paymentStatus'];
          if (eventType === 'payment_intent.succeeded') {
            sails.log(
              `💰 Stripe card payment succeeded for order: "${order.publicId}"`
            );
            paymentStatus = 'paid';
            if (order.firebaseRegistrationToken){
              sails.log.warn(`Firebase notifications on registration tokens (i.e. "${order.firebaseRegistrationToken}" for order[${order.id}]) are  not currently working...`);
              await sails.helpers.sendFirebaseNotification.with({
                // topic: `order-${order.publicId}`,
                token: order.firebaseRegistrationToken,
                title: 'Payment success',
                body: '✅ Payment on vegi succeeded',
                data: {
                  orderId: `${order.id}`,
                },
              });
            }
            await sails.helpers.broadcastFirebaseNotificationForTopic.with({
              topic: `order-${order.publicId}`,
              title: `Payment success`,
              body: '✅ Payment on vegi succeeded',
              data: {
                orderId: `${order.id}`,
              },
            });
            
          } else if (eventType === 'payment_intent.processing') {
            sails.log(
              '🧧 Stripe webhook: Successfully created payment intent for customer'
            );
            paymentStatus = 'unpaid';
            // do nothing for now...
          } else if (eventType === 'payment_intent.payment_failed') {
            sails.log('❌ Stripe webhook: Payment failed.');
            paymentStatus = 'failed';
            if(order.firebaseRegistrationToken){
              await sails.helpers.sendFirebaseNotification.with({
                // topic: `order-${order.publicId}`,
                token: order.firebaseRegistrationToken,
                title: 'Payment failed',
                body: '❌ Payment on vegi failed',
                data: {
                  orderId: `${order.id}`,
                },
              });  
            }
            await sails.helpers.broadcastFirebaseNotificationForTopic.with({
              topic: `order-${order.publicId}`,
              title: 'Payment failed',
              body: '❌ Payment on vegi failed',
              data: {
                orderId: `${order.id}`,
              },
            });
          }

          // if (dataObj['metadata'] && dataObj['metadata']['webhookAddress']) {
          //   // TODO: REMOVE THIS as this old from the peeplPay server to connect peepl pay to vegi backend via webhooks written into the stripe metadata.
          //   const wh = dataObj['metadata']['webhookAddress'];
          //   sails.log.info(
          //     `Calling webhook from metadata of paymentintent object with url: "${wh}"`
          //   );
          //   await axios.get(wh);
          // }

          if (
            process.env.NODE_ENV &&
            !process.env.NODE_ENV.toLowerCase().startsWith('prod')
          ) {
            sails.log(
              `stripe-event-webhook updating order w/ payIntId: [${paymentIntent.id}] to ${paymentStatus}!`
            );
          }

          var unixtime = Date.now();

          if (!['paid', 'unpaid', 'failed'].includes(paymentStatus)) {
            sails.log.warn(
              `stripe-event-webhook received a vegi paymentStatus enum: PaymentStatus.[${paymentStatus}]. This is not handled!`
            );
          }
          if (sails.config.custom.baseUrl !== 'https://vegi.vegiapp.co.uk') {
            const util = require('util');
            sails.log(
              `stripe-event-webook called with inputs: ${util.inspect(inputs, {
                depth: null,
              })}`
            );
          }

          // Update order with payment ID and time
          try {
            await Order.updateOne({
              paymentIntentId: paymentIntent.id,
              completedFlag: 'none',
            }).set({
              paymentStatus: ['paid', 'unpaid', 'failed'].includes(
                paymentStatus
              )
                ? paymentStatus
                : 'failed',
              paidDateTime: unixtime,
            });
          } catch (error) {
            sails.log.error(error);
          }

          order = await Order.findOne(order.id).populate('vendor');


          try {
            if (order.paymentStatus === 'paid') {
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
            } else if (order.paymentStatus === 'unpaid') {
              await sails.helpers.sendSlackNotification.with({ order: order });
              await sails.helpers.sendSmsNotification.with({
                to: order.deliveryPhoneNumber,
                body:
                  'Your payment for a recent order failed. Details of order ' +
                  order.fulfilmentSlotFrom +
                  ' and ' +
                  order.fulfilmentSlotTo +
                  '. Please review your payment method in the vegi app.',
                data: {
                  orderId: order.id,
                },
              });
            } else {
              sails.log.warn(`Payment for recent order[${order.id}] hit the stripe-event-webhook with paymentStatus of ${order.paymentStatus} and contained inputs: ${util.inspect(inputs, {depth: null})}`);
            }
          } catch (error) {
            sails.log.error(
              `stripe-event-webhook errored sending sms notification to vendor for paid order: ${error}`
            );
          }

          // turn into transaction if supported, then fo an order find after to check the updated order and TX
          try {
            await Order.update({
              publicId: order.publicId,
            }).set({
              paymentStatus: 'paid',
              paidDateTime: Date.now(), // TODO: Consider casting sql type to timestamp with a temp colum to do the cast and then channing the type here. and then using moment().format(datetimeStrFormatExactForSQLTIMESTAMP)
            });
          } catch (error) {
            sails.log.error(
              `stripe-event-webhook errored when updating order with publicId: "${order.publicId}" to "paymentStatus:paid": ${error}`
            );
            sails.log.error(error);
            return exits.error(
              `Failed to set order to "paid" with error: ${error}`
            );
          }
          try {
            if(order.discounts && order.discounts.length > 0){
              const addTxFn = async (discount:DiscountType) => {
                if (discount.discountType === 'fixed') {
                  await Transaction.create({
                    amount: discount.value,
                    currency: discount.currency,
                    discount: discount.id,
                    order: order.id,
                    payer: order.customerWalletAddress,
                    receiver: order.vendor.walletAddress,
                    timestamp: moment().format(
                      datetimeStrFormatExactForSQLTIMESTAMP
                    ),
                  });
                  await Discount.update({
                    id: discount.id
                  }).set({
                    timesUsed: discount.timesUsed + 1,
                    isEnabled: false,
                  });
                  await Discount.addToCollection(discount.id, 'orders').members(
                    [order.id]
                  );
                  return;
                } else if (discount.discountType === 'percentage') {
                  let amount = (discount.value / 100) * order.subtotal;
                  if(discount.value > 100) {
                    sails.log.error(
                      `Cant add percentage discount to order with value > 100% for discount with code: ${discount.code}`
                    );
                    return;
                  } else if (discount.value < 0){
                    sails.log.error(
                      `Cant add percentage discount to order with value < 0% for discount with code: ${discount.code}`
                    );
                    return;
                  } else {
                    sails.log(`Percentage discount of ${discount.value}% applied to order subtotal gives discounted amount of ${amount} [${discount.currency}]`);
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
                    timestamp: moment().format(
                      datetimeStrFormatExactForSQLTIMESTAMP
                    ),
                  });
                  await Discount.update({
                    id: discount.id,
                  }).set({
                    timesUsed: discount.timesUsed + 1,
                    isEnabled: discount.isEnabled && (discount.timesUsed + 1) < discount.maxUses,
                  });
                  await Discount.addToCollection(discount.id, "orders").members([order.id]);
                  return;
                } else {
                  sails.log.warn(`Unable to calculate discounts in stripe-event-webhook for discounts with type: "${discount.discountType}"`);
                }
              };
              await Promise.all(order.discounts.map((discount) => addTxFn(discount)));
            }
          } catch (error) {
            sails.log.error(
              `stripe-event-webhook errored when updating discounts on order: "${order.publicId}" with error: ${error}`
            );
            sails.log.error(error);
            return exits.error(
              `stripe-event-webhook errored when updating discounts on order: "${order.publicId}" with error: ${error}`
            );
          }
          
        }
      } else if (
        eventType.startsWith('customer') &&
        dataObj['object'] === 'customer'
      ) {
        // Check that the customerId matches the accountId.customerId on the order via 
        // order.customerWalletAddress -> account.walletAddress -> account.stripeCustomerId
        const customer:Stripe.Customer = dataObj as any;
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
      } else {
        sails.log.info(`Ignoring Stripe Webhook event: ["${eventType}"]`);
        // Handle the event
        switch (eventType) {
          case 'checkout.session.async_payment_failed':
            {
              const checkoutSessionAsyncPaymentFailed = dataObj;
              sails.log(
                `${checkoutSessionAsyncPaymentFailed} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event checkout.session.async_payment_failed
            break;
          case 'checkout.session.async_payment_succeeded':
            {
              const checkoutSessionAsyncPaymentSucceeded = dataObj;
              sails.log(
                `${checkoutSessionAsyncPaymentSucceeded} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event checkout.session.async_payment_succeeded
            break;
          case 'checkout.session.completed':
            {
              const checkoutSessionCompleted = dataObj;
              sails.log(
                `${checkoutSessionCompleted} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event checkout.session.completed
            break;
          case 'checkout.session.expired':
            {
              const checkoutSessionExpired = dataObj;
              sails.log(
                `${checkoutSessionExpired} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event checkout.session.expired
            break;
          case 'payment_intent.amount_capturable_updated':
            {
              const paymentIntentAmountCapturableUpdated = dataObj;
              sails.log(
                `${paymentIntentAmountCapturableUpdated} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.amount_capturable_updated
            break;
          case 'payment_intent.canceled':
            {
              const paymentIntentCanceled = dataObj;
              sails.log(
                `${paymentIntentCanceled} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.canceled
            break;
          case 'payment_intent.created':
            {
              const paymentIntentCreated = dataObj;
              sails.log(
                `${paymentIntentCreated} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.created
            break;
          case 'payment_intent.partially_funded':
            {
              const paymentIntentPartiallyFunded = dataObj;
              sails.log(
                `${paymentIntentPartiallyFunded} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.partially_funded
            break;
          case 'payment_intent.payment_failed':
            {
              const paymentIntentPaymentFailed = dataObj;
              sails.log(
                `${paymentIntentPaymentFailed} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.payment_failed
            break;
          case 'payment_intent.processing':
            {
              const paymentIntentProcessing = dataObj;
              sails.log(
                `${paymentIntentProcessing} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.processing
            break;
          case 'payment_intent.requires_action':
            {
              const paymentIntentRequiresAction = dataObj;
              sails.log(
                `${paymentIntentRequiresAction} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.requires_action
            break;
          case 'payment_intent.succeeded':
            {
              const paymentIntentSucceeded = dataObj;
              sails.log(
                `${paymentIntentSucceeded} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
          case 'topup.canceled':
            {
              const topupCanceled = dataObj;
              sails.log(
                `${topupCanceled} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event topup.canceled
            break;
          case 'topup.created':
            {
              const topupCreated = dataObj;
              sails.log(
                `${topupCreated} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event topup.created
            break;
          case 'topup.failed':
            {
              const topupFailed = dataObj;
              sails.log(
                `${topupFailed} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event topup.failed
            break;
          case 'topup.reversed':
            {
              const topupReversed = dataObj;
              sails.log(
                `${topupReversed} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event topup.reversed
            break;
          case 'topup.succeeded':
            {
              const topupSucceeded = dataObj;
              sails.log(
                `${topupSucceeded} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event topup.succeeded
            break;
          case 'transfer.created':
            {
              const transferCreated = dataObj;
              sails.log(
                `${transferCreated} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event transfer.created
            break;
          case 'transfer.reversed':
            {
              const transferReversed = dataObj;
              sails.log(
                `${transferReversed} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event transfer.reversed
            break;
          case 'transfer.updated':
            {
              const transferUpdated = dataObj;
              sails.log(
                `${transferUpdated} event occured in 'stripe-event-webhook' endpoint`
              );
            }
            // Then define and call a function to handle the event transfer.updated
            break;
          // ... handle other event types
          default:
            sails.log(`Unhandled event type ${eventType}`);
        }
      }
      return exits.success();
    } catch (error) {
      return exits.error(error);
    }
  },
};

module.exports = _exports;
