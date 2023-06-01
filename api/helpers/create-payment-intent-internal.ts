/* eslint-disable camelcase */

import stripe, { StripeKeys } from '../../scripts/load_stripe';
import Stripe from 'stripe';
import { CurrencyStripeAllowedTypeLiteral, PaymentIntentMetaDataType, SailsActionDefnType } from '../../scripts/utils';
import {
  sailsVegi,
} from '../interfaces/iSails';
import { Currency } from '../../api/interfaces/peeplPay';

declare var sails: sailsVegi;

export type CreatePaymentIntentInternalInputs = {
  amount: number; // amount in pence
  currency: Currency;
  // customerPayToStripeAccountId: string; not needed to set up the payment intent
  customerId?: string | null | undefined; // "cus_Nkl5aUAezd6MIa"
  vendorDisplayName?:  string | null | undefined;
  recipientWalletAddress?: string | null | undefined;
  senderWalletAddress?: string | null | undefined;
  accountId?: number | null | undefined;
  orderId: number;
  webhookAddress?: string | null | undefined;
};

export type CreatePaymentIntentInternalResult =
  | {
      paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
      ephemeralKey: string;
      customer: string;
      publishableKey: string;
    }
  | false;

export type CreatePaymentIntentInternalExits = {
  success: (unusedData: CreatePaymentIntentInternalResult) => any;
};

const _exports: SailsActionDefnType<
  CreatePaymentIntentInternalInputs,
  CreatePaymentIntentInternalResult,
  CreatePaymentIntentInternalExits
> = {
  friendlyName: 'CreatePaymentIntentInternal',

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
      required: false,
    },
    accountId: {
      type: 'number',
      required: false,
    },
    webhookAddress: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: CreatePaymentIntentInternalInputs,
    exits: CreatePaymentIntentInternalExits
  ) {
    let customer: Stripe.Customer | Stripe.DeletedCustomer; // ~ https://stripe.com/docs/api/accounts
    if (inputs.customerId) {
      customer = await stripe.customers.retrieve(inputs.customerId); // todo: link the stripe customer id in the new stripe model table that links optionally to the users table or doesnt link and the customers stripe customer id is stored in the cloud on their device for security
    } else {
      customer = await stripe.customers.create();
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2022-11-15' }
    );

    try {
      const meta: PaymentIntentMetaDataType = {
        amount: inputs.amount,
        currency: inputs.currency,
        accountId: inputs.accountId,
        senderWalletAddress: inputs.senderWalletAddress,
        walletAddress: inputs.recipientWalletAddress,
        recipientWalletAddress: inputs.recipientWalletAddress,
        orderId: inputs.orderId,
        webhookAddress: inputs.webhookAddress, // dont need to call the stipeEventWebhook, that is confiured to be called from the stripe dashboard for all events... (https://stripe.com/docs/webhooks#webhooks-summary)
        // webhookAddress: inputs.webhookAddress || sails.config.custom.stripeEventWebhook,
      };
      const inputCurrency = inputs.currency.toLocaleLowerCase();
      let useCurrency = 'gbp';
      let inputAmountPence = inputs.amount; //stripe expects gbp amounts in pence as ints
      if (inputCurrency === Currency.GBPx.toLocaleLowerCase()) {
        useCurrency = 'gbp';
        inputAmountPence = inputs.amount;
      } else if (inputCurrency === Currency.PPL.toLocaleLowerCase()) {
        sails.log.error(`Cant make a stripe payment intent for PPL tokens.`);
        return exits.success(false);
      } else if (inputCurrency === Currency.GBP.toLocaleLowerCase()) {
        useCurrency = 'gbp';
        inputAmountPence = Math.round(inputs.amount * 100);
      } else if (inputCurrency === Currency.USD.toLocaleLowerCase()) {
        useCurrency = 'usd';
        inputAmountPence = Math.round(inputs.amount * 100);
      } else if (inputCurrency === Currency.EUR.toLocaleLowerCase()) {
        useCurrency = 'eur';
        inputAmountPence = Math.round(inputs.amount * 100);
      } else if (inputCurrency === Currency.GBT.toLocaleLowerCase()) {
        sails.log.error(`Cant make a stripe payment intent for GBT tokens.`);
        return exits.success(false);
      } else {
        sails.log.error(
          `Cant make a stripe payment intent for [${inputCurrency}].`
        );
        return exits.success(false);
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: inputAmountPence, //TODO get amounts from end ppoint inputs...
        currency: useCurrency,
        customer: customer.id,
        statement_descriptor: inputs.vendorDisplayName || 'vegi',// + ` (${})`,
        payment_method_types: ['card', 'card_present', 'link'], // ~ https://stripe.com/docs/api/payment_intents/create#create_payment_intent-payment_method_types
        // automatic_payment_methods: {
        //   enabled: true,
        // },
        metadata: meta,
        setup_future_usage: 'off_session',
      });
      return exits.success({
        paymentIntent: paymentIntent,
        ephemeralKey: ephemeralKey.secret, // used temporarily to allow client to fetch card details from client side stripe api and populate payment box
        customer: customer.id,
        publishableKey: StripeKeys.publishableKey,
      });
    } catch (error) {
      sails.log.error(error);
      return exits.success(false);
    }
  },
};

module.exports = _exports;
