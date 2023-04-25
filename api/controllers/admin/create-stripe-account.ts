import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  
} from '../../../scripts/utils';
import stripe, { StripeKeys } from '../../../scripts/load_stripe';
import {Stripe} from 'stripe';
import { StripeAccountType } from '../../../api/interfaces/payments/stripe/iStripeAccount';

declare var sails: sailsVegi;
declare var StripeAccount: SailsModelType<StripeAccountType>;


export type CreateStripeAccountInputs = { // ~ https://stripe.com/docs/api/accounts/create
  companyName: string,
  businessType: 'company' | 'individual' | 'non_profit',
  email: string,
  defaultCurrency: 'gbp',
} ;// | Stripe.AccountCreateParams;

export type CreateStripeAccountResponse = Stripe.Response<Stripe.Account> | false;

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
    companyName: {
      type: 'string',
      required: true,
    },
    businessType: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    defaultCurrency: {
      type: 'string',
      required: false,
      defaultsTo: 'gbp',
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
    const account = await stripe.accounts.create({
      type: 'standard',
      company: {
        name: inputs.companyName
      },
      email: inputs.email,
      default_currency: inputs.defaultCurrency,
      business_type: inputs.businessType, // individual, company, non_profit, 
      
    } as any);    

    return exits.success(account);
  },
};

module.exports = _exports;
