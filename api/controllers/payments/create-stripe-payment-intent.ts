/* eslint-disable camelcase */

import {
  CurrencyStripeAllowedTypeLiteral,
  SailsActionDefnType,
} from '../../../scripts/utils';
import Stripe from 'stripe';
import { sailsVegi } from '../../../api/interfaces/iSails';
import { CreatePaymentIntentInternalInputs, CreatePaymentIntentInternalResult } from '../../../api/helpers/create-payment-intent-internal';

declare var sails: sailsVegi;


export type CreateStripePaymentAttemptInputs = CreatePaymentIntentInternalInputs /*{
  amount: number; // amount in pence
  currency: CurrencyStripeAllowedTypeLiteral;
  // customerPayToStripeAccountId: string; not needed to set up the payment intent
  customerId?: string | null | undefined; // "cus_Nkl5aUAezd6MIa"
  vendorDisplayName?:  string | null | undefined;
  recipientWalletAddress?: string | null | undefined;
  webhookAddress?: string | null | undefined;
};*/

export type CreateStripePaymentAttemptResponse =
  | CreatePaymentIntentInternalResult;
  // | {
  //     paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
  //     paymentMethods: Stripe.Response<Stripe.ApiList<Stripe.PaymentMethod>>;
  //     ephemeralKey: string;
  //     customer: string;
  //     publishableKey: string;
  //   }
  // | false;

export type CreateStripePaymentAttemptExits = {
  success: (unusedData: CreateStripePaymentAttemptResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  CreateStripePaymentAttemptInputs,
  CreateStripePaymentAttemptResponse,
  CreateStripePaymentAttemptExits
> = {
  friendlyName: 'CreateStripePaymentAttempt',

  inputs: {
    amount: {
      type: 'number',
      required: true,
      description: 'Amount in pence or base unit of currency',
      min: 0,
    },
    currency: {
      type: 'string',
      required: true,
    },
    customerId: {
      type: 'string',
      required: false,
    },
    webhookAddress: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    vendorDisplayName: {
      type: 'string',
      required: false,
    },
    recipientWalletAddress: {
      type: 'string',
      required: false,
    },
    senderWalletAddress: {
      type: 'string',
      required: false,
    },
    orderId: {
      type: 'number',
      required: true,
    },
    accountId: {
      type: 'number',
      required: true,
    },
    receiptEmail: {
      type: 'string',
      required: false,
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
    inputs: CreateStripePaymentAttemptInputs,
    exits: CreateStripePaymentAttemptExits
  ) {
    const result = await sails.helpers.createPaymentIntentInternal.with(inputs);
    return exits.success(result);
  },
};

module.exports = _exports;
