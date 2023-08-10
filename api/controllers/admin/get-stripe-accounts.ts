import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  
} from '../../../scripts/utils';
import stripeFactory from '../../../scripts/load_stripe';
import {Stripe} from 'stripe';

// ~ https://stripe.com/docs/api/accounts/create
export type CreateStripeAccountInputs = Stripe.AccountListParams;

export type CreateStripeAccountResponse = Stripe.Response<
  Stripe.ApiList<Stripe.Account>
>;

export type CreateStripeAccountExits = {
  success: (unusedData: CreateStripeAccountResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  CreateStripeAccountInputs,
  CreateStripeAccountResponse,
  CreateStripeAccountExits
> = {
  friendlyName: 'CreateStripeAccount',

  inputs: {
    created: {
      type: 'ref',
      defaultsTo: {},
    },
    ending_before: {
      type: 'string',
      required: false,
    },
    starting_after: {
      type: 'string',
      required: false,
    },
    limit: {
      type: 'number',
      defaultsTo: 10,
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
    inputs: CreateStripeAccountInputs,
    exits: CreateStripeAccountExits
  ) {
    const stripe = await stripeFactory(this.req.session.userId);
    const accounts = await stripe.accounts.list(inputs);

    return exits.success(accounts);
  },
};

module.exports = _exports;
