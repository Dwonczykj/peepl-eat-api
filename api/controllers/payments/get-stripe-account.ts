import stripe from '../../../scripts/load_stripe';
import Stripe from 'stripe';
import {
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;


export type GetStripeAccountInputs = {
  stripeCustomerId: string,
};

export type GetStripeAccountResponse = Stripe.Account | false;

export type GetStripeAccountExits = {
  success: (unusedData: GetStripeAccountResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  GetStripeAccountInputs,
  GetStripeAccountResponse,
  GetStripeAccountExits
> = {
  friendlyName: 'GetStripeAccount',

  inputs: {
    stripeCustomerId: {
      type: 'string',
      required: true,
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
    inputs: GetStripeAccountInputs,
    exits: GetStripeAccountExits
  ) {
    try {
      const account = await stripe.accounts.retrieve(inputs.stripeCustomerId);
      return exits.success(account);
    } catch (error) {
      sails.log.error(error);
      return exits.success(false);
    }
  },
};

module.exports = _exports;
