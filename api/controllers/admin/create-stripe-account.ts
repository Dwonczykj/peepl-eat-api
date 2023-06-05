import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  AccountType,
  SailsActionDefnType,
  
} from '../../../scripts/utils';
import stripe, { StripeKeys } from '../../../scripts/load_stripe';
import {Stripe} from 'stripe';
import { StripeAccountType } from '../../../api/interfaces/payments/stripe/iStripeAccount';
import { Currency } from '../../../api/interfaces/peeplPay';

declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;


export type CreateStripeAccountInputs = { // ~ https://stripe.com/docs/api/accounts/create
  account: number;
  companyName: string,
  businessType: 'company' | 'individual' | 'non_profit',
  email: string,
  defaultCurrency: Currency,
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
    account: {
      type: 'number',
      required: true,
    },
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
    let vegiAccount: sailsModelKVP<AccountType>;
    try {
      const vegiAccounts = await Account.find({
        id: inputs.account,
      });
      if (!vegiAccounts || vegiAccounts.length < 1){
        sails.log.warn(`No account found for id: "${inputs.account}" in create-stripe-account action`);
        return exits.success(false);
      }
      vegiAccount = vegiAccounts[0];
    } catch (error) {
      sails.log.error(
        `No account found for id: "${inputs.account}" in create-stripe-account action with error: ${error}`
      );
      return exits.success(false);
    }
    
    try {
      const account = await stripe.accounts.create({
        type: 'standard',
        company: {
          name: inputs.companyName
        },
        email: inputs.email,
        default_currency: inputs.defaultCurrency,
        business_type: inputs.businessType, // individual, company, non_profit, 
        
      } as any);
      try {
        await Account.updateOne(vegiAccount.id).set({
          stripeAccountId: account.id
        });
  
        return exits.success(account);
      } catch (error) {
        sails.log.error(`Failed to update account in vegi with new stripe account id. Error: ${error}`);
        return exits.success(false);
      }
    } catch (error) {
      sails.log.error(`Failed to create stripe account from stripe sdk with error: ${error}`);
      return exits.success(false);
    }
  },
};

module.exports = _exports;
