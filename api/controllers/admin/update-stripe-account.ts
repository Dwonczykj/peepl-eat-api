import stripeFactory from '../../../scripts/load_stripe';
import Stripe from 'stripe';
import {
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;


export type UpdateStripeAccountInputs = {
  stripeCustomerId: string;
  updateCustomerParams: Stripe.AccountUpdateParams;
};

export type UpdateStripeAccountResponse = Stripe.Account | false;

export type UpdateStripeAccountExits = {
  success: (unusedData: UpdateStripeAccountResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  UpdateStripeAccountInputs,
  UpdateStripeAccountResponse,
  UpdateStripeAccountExits
> = {
  friendlyName: 'UpdateStripeAccount',

  inputs: {
    stripeCustomerId: {
      type: 'string',
      required: true,
    },
    updateCustomerParams: {
      type: 'ref',
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
    inputs: UpdateStripeAccountInputs,
    exits: UpdateStripeAccountExits
  ) {
    try {
      const stripe = await stripeFactory(this.req.session.userId);
      const account = await stripe.accounts.update(inputs.stripeCustomerId, inputs.updateCustomerParams);
      return exits.success(account);
    } catch (error) {
      sails.log.error(`${error}`);
      return exits.success(false);
    }
  },
};

module.exports = _exports;
