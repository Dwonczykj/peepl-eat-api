/* eslint-disable camelcase */
import stripe from '../../../scripts/load_stripe';
import Stripe from 'stripe';
import {
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  has
} from '../../../scripts/utils';
// import { CreatePaymentIntentInternalResult } from '../../../api/helpers/create-payment-intent-internal';

declare var sails: sailsVegi;

export type CheckStripePaymentIntentInputs = {
  paymentIntentId: string;
  client_secret?: string | null | undefined;
};

export type CheckStripePaymentIntentResponse =
  | {
      paymentIntent: Omit<Stripe.Response<Stripe.PaymentIntent>,'client_secret'>;
      paymentMethods: Stripe.PaymentMethod[];
      customer: Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>;
    }
  | false;

export type CheckStripePaymentIntentExits = {
  success: (unusedData: CheckStripePaymentIntentResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  CheckStripePaymentIntentInputs,
  CheckStripePaymentIntentResponse,
  CheckStripePaymentIntentExits
> = {
  friendlyName: 'CheckStripePaymentIntent',

  inputs: {
    paymentIntentId: {
      type: 'string',
      required: true,
    },
    client_secret: {
      type: 'string',
      required: false,
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
    inputs: CheckStripePaymentIntentInputs,
    exits: CheckStripePaymentIntentExits
  ) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(inputs.paymentIntentId, !inputs.client_secret ? {} : {
        client_secret: inputs.client_secret,
      });
      sails.log.verbose(`Retrieved paymentIntent[${paymentIntent.id}] for customer[${paymentIntent.customer}]`);
      let paymentMethods: Stripe.PaymentMethod[] = [];
      let customerId:string;
      let customer: Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>;
      if(
        paymentIntent 
        && paymentIntent.customer){
        if(typeof paymentIntent.customer === 'string'){
          customerId = paymentIntent.customer;
        } else if (typeof paymentIntent.customer === 'object' && has('id', paymentIntent.customer)){
          customerId = paymentIntent.customer.id;
        }
      }
      if(customerId){
        customer = await stripe.customers.retrieve(customerId);
        const paymentMethodsResponse =
          await stripe.customers.listPaymentMethods(customerId);
        if(paymentMethodsResponse
          && paymentMethodsResponse.data){
          paymentMethods = [
            ...paymentMethods,
            ...paymentMethodsResponse.data,
          ];
        }
        if (paymentMethodsResponse && paymentMethodsResponse.has_more) {
          const morePaymentMethodsResponse =
            await stripe.customers.listPaymentMethods(customerId, {
              starting_after: paymentMethods[paymentMethods.length].id,
            });
          if (morePaymentMethodsResponse && morePaymentMethodsResponse.data) {
            paymentMethods = [
              ...paymentMethods,
              ...morePaymentMethodsResponse.data,
            ];
          }
        }
      }
      // Delete client_secret now from payment_intent as otherwise Stripe.PaymentIntent.toJson will throw as not meant to be passed back again...
      delete paymentIntent.client_secret;
      const {client_secret, ...safePaymentIntent} = paymentIntent;
      return exits.success({
        paymentIntent: safePaymentIntent,
        paymentMethods: paymentMethods,
        customer: customer,
      });
    } catch (error) {
      if(typeof error === 'object' && has('message', error) && typeof error.message === 'string' && error.message.includes("client_secret")){
        sails.log.warn(`Consider removing client_secret from the client side request at this point in your client side payment flow.`);
      }
      sails.log.error(error);
      return exits.success(false);
    }
  },
};

module.exports = _exports;
