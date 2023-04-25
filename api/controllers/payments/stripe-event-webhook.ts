/* eslint-disable camelcase */
import stripe from '../../../scripts/load_stripe';
import Stripe from 'stripe';
import _ from 'lodash';
import axios from 'axios';
import {
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  OrderType,
  SailsActionDefnType,
} from '../../../scripts/utils';
import { generateCorrelationId, mintTokensAndSendToken } from '../../../fuse/fuseApi';

declare var sails: sailsVegi;
declare var Order: SailsModelType<OrderType>;

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
    }
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

    if (sails.config.custom.has('stripeWebhookSecret')) {
      let event: Stripe.Event;
      const signature = this.req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          this.req.rawBody, // ! inputs
          signature,
          sails.config.custom.get('stripeWebhookSecret')
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

    if (eventType.startsWith('payment_intent')){
      const paymentIntentId = dataObj['paymentIntentId'];
      const orders = await Order.find({
        paymentIntentId: paymentIntentId,
      });
      if (!orders || orders.length < 1){
        const e = Error(`Stripe Event Webook for "${eventType}" webhook was unable to locate an order with matching payment intent: "${paymentIntentId}"`);
        sails.log.error(e);
        return exits.error(e);
      }
      const order = orders[0];

      if (eventType === 'payment_intent.succeeded') {
        sails.log('💰 Payment captured!');
        const { amount, walletAddress: toAddress } = _.get(dataObj, ['charges', 'data', '0', 'metadata'], {});
        if(toAddress){
          // Crypto Transaction:...
          sails.log(`Minting ${amount} ${toAddress} 💰!`);
          const correlationId = generateCorrelationId();
          await mintTokensAndSendToken({
            correlationId,
            toAddress,
            amount: amount / 100
          });
        }else{
          sails.log(`Raw Stripe payment succeeded`);
          // todo: Alert client from clientId in metadata...
          await sails.helpers.sendFirebaseNotification.with({
            topic: `order-${order.publicId}`,
            title: 'Payment succeeded',
            body: '✅ Payment on vegi succeeded',
            data: {
              orderId: order.id,
            },
          });
        }
      } else if(eventType === 'payment_intent.processing'){
        sails.log('🧧 Successfully created payment intent for customer');
        // do nothing for now...
      } else if (eventType === 'payment_intent.payment_failed') {
        sails.log('❌ Payment failed.');
        await sails.helpers.sendFirebaseNotification.with({
          topic: `order-${order.publicId}`,
          title: 'Payment failed',
          body: '❌ Payment on vegi failed',
          data: {
            orderId: order.id,
          },
        });
      }

      if(dataObj['metadata'] && dataObj['metadata']['webhookAddress']){
        const wh = dataObj['metadata']['webhookAddress'];
        sails.log.info(`Calling webhook from metadata of paymentintent object with url: "${wh}"`);
        await axios.get(wh);
      }
    } else {
      sails.log.info(`Ignoring Stripe Webhook event: ["${eventType}"]`);
    }
    return exits.success();
  },
};

module.exports = _exports;
