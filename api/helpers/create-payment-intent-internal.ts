/* eslint-disable camelcase */

import stripe, { StripeKeys } from '../../scripts/load_stripe';
import Stripe from 'stripe';
import { AccountType, CurrencyStripeAllowedTypeLiteral, OrderType, PaymentIntentMetaDataType, SailsActionDefnType } from '../../scripts/utils';
import {
  SailsModelType,
  sailsModelKVP,
  sailsVegi,
} from '../interfaces/iSails';
import { Currency } from '../../api/interfaces/peeplPay';

declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;
declare var Order: SailsModelType<OrderType>;

export type CreatePaymentIntentInternalInputs = {
  amount: number; // amount in pence
  currency: Currency;
  // customerPayToStripeAccountId: string; not needed to set up the payment intent
  customerId?: string | null | undefined; // "cus_Nkl5aUAezd6MIa"
  vendorDisplayName?: string | null | undefined;
  recipientWalletAddress?: string | null | undefined;
  senderWalletAddress?: string | null | undefined;
  accountId?: number | null | undefined;
  orderId: number;
  webhookAddress?: string | null | undefined;
  receiptEmail?: string | null | undefined;
};

export type CreatePaymentIntentInternalResult =
  | {
      paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
      setupIntent: Stripe.Response<Stripe.SetupIntent> | null;
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
    receiptEmail: {
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
    
    let vegiAccount: sailsModelKVP<AccountType>;
    try {
      const vegiAccounts = await Account.find({
        id: inputs.accountId,
      });
      if (!vegiAccounts || vegiAccounts.length < 1) {
        sails.log.warn(
          `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper`
        );
        return exits.success(false);
      }
      vegiAccount = vegiAccounts[0];
    } catch (error) {
      sails.log.error(
        `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper with error: ${error}`
      );
      return exits.success(false);
    }

    let order: sailsModelKVP<OrderType>;
    try {
      const orders = await Order.find({
        id: inputs.orderId,
      });
      if (!orders || orders.length < 1) {
        sails.log.warn(
          `No order found for id: "${inputs.orderId}" in create-payment-intent-internal helper`
        );
        return exits.success(false);
      }
      order = orders[0];
    } catch (error) {
      sails.log.error(
        `No order found for id: "${inputs.orderId}" in create-payment-intent-internal helper with error: ${error}`
      );
      return exits.success(false);
    }

    let customer: Stripe.Customer | Stripe.DeletedCustomer; // ~ https://stripe.com/docs/api/accounts
    let setupIntent: Stripe.Response<Stripe.SetupIntent> | null = null;
    if (inputs.customerId) {
      customer = await stripe.customers.retrieve(inputs.customerId); // todo: link the stripe customer id in the new stripe model table that links optionally to the users table or doesnt link and the customers stripe customer id is stored in the cloud on their device for security
      sails.log.verbose(`Stripe customer RETRIEVED with id: "${customer.id}" and to be ensured sync with vegiAccount[${vegiAccount && vegiAccount.id}] from inputs.accountId: ${inputs.accountId}`);
    } else {
      customer = await stripe.customers.create();  
      sails.log.verbose(`Stripe customer CREATED with id: "${customer.id}" and to be added to vegiAccount[${vegiAccount && vegiAccount.id}] from inputs.accountId: ${inputs.accountId}`);
      // try {
      //   setupIntent = await stripe.setupIntents.create({
      //     usage: 'on_session', // ~ https://stripe.com/docs/api/setup_intents/create#create_setup_intent-usage
      //     customer: customer.id,
      //     // payment_method_types: ['card', 'link'], // [acss_debit, au_becs_debit, bacs_debit, bancontact, boleto, card, card_present, cashapp, ideal, link, paypal, sepa_debit, sofort, and us_bank_account]
      //     automatic_payment_methods: {
      //       enabled: true,
      //     }, // ~ https://stripe.com/docs/api/setup_intents/create#create_setup_intent-automatic_payment_methods
      //   });
      // } catch (error) {
      //   sails.log.error(`Unable to create stripe setupIntent in createPaymentIntentInternal helper. Error: ${error}`);
      //   setupIntent = null;
      // }
    }
    if (
      !vegiAccount.stripeCustomerId ||
      vegiAccount.stripeCustomerId !== customer.id
    ) {
      try {
        await Account.updateOne(vegiAccount.id).set({
          stripeCustomerId: customer.id,
        });
      } catch (error) {
        sails.log.error(
          `Failed to update account in vegi with new stripe account id. Error: ${error}`
        );
        return exits.success(false);
      }
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
        shipping: {
          name: order.deliveryName,
          address: {
            state: order.deliveryAddressCity,
            city: order.deliveryAddressCity,
            line1: order.deliveryAddressLineOne,
            postal_code: order.deliveryAddressPostCode,
            country: 'GB', // ~ https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
          },
        },
        // Edit the following to support different payment methods in your PaymentSheet
        // Note: some payment methods have different requirements: https://stripe.com/docs/payments/payment-methods/integration-options
        payment_method_types: [
          'card',
          // 'ideal',
          // 'sepa_debit',
          // 'sofort',
          // 'bancontact',
          // 'p24',
          // 'giropay',
          // 'eps',
          // 'afterpay_clearpay',
          // 'klarna',
          // 'us_bank_account',
        ],
        statement_descriptor: inputs.vendorDisplayName || 'vegi', // + ` (${})`,
        // payment_method_types: ['card', 'link'],
        // ['card_present', 'link', acss_debit, affirm, afterpay_clearpay, alipay, au_becs_debit, bacs_debit, bancontact, blik, boleto, card, card_present, cashapp, customer_balance, eps, fpx, giropay, grabpay, ideal, interac_present, klarna, konbini, link, oxxo, p24, paynow, paypal, pix, promptpay, sepa_debit, sofort, us_bank_account, wechat_pay, and zip]
        // ~ https://stripe.com/docs/api/payment_intents/create#create_payment_intent-payment_method_types
        // automatic_payment_methods: {
        //   enabled: true,
        // },
        metadata: meta,

        /// ~ https://stripe.com/docs/payments/setup-intents
        /// NOTE However, if you only plan to use the card when the customer is checking out, set usage to on_session. This lets the bank know you plan to use the card when the customer is available to authenticate, so you can postpone authenticating the card details until then and avoid upfront friction.
        // setup_future_usage: 'off_session',
        // receipt_email: inputs.receiptEmail || order.deliveryEmail || undefined,
      });
      return exits.success({
        paymentIntent: paymentIntent,
        setupIntent: setupIntent,
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
