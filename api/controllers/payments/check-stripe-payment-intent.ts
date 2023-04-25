/* eslint-disable camelcase */
import stripe from '../../../scripts/load_stripe';
import Stripe from 'stripe';
import {
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;

export type CheckStripePaymentIntentInputs = {
  paymentIntentId: string;
  client_secret?: string | null | undefined;
};

export type CheckStripePaymentIntentResponse = {paymentIntent: Stripe.Response<Stripe.PaymentIntent>} | false;

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
      return exits.success({paymentIntent: paymentIntent});
    } catch (error) {
      sails.log.error(error);
      return exits.success(false);
    }
  },
};

module.exports = _exports;
