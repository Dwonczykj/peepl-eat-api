/* eslint-disable camelcase */

import stripeFactory, { StripeKeys, userIsTester } from '../../scripts/load_stripe';
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
  userId: number | null | undefined;
  orderId: number;
  webhookAddress?: string | null | undefined;
  receiptEmail?: string | null | undefined;
};

export type CreatePaymentIntentInternalResult =
  | {
      paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
      paymentMethods: Stripe.PaymentMethod[];
      customer: Stripe.Customer;
      ephemeralKey: string;
      publishableKey: string;
      setupIntent: Stripe.Response<Stripe.SetupIntent> | null;
      success: true,
    }
  | {
    error: Error, 
    message: string, 
    success: false,
  };

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
    userId: {
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
    const stripe = await stripeFactory(inputs.userId);
    const isTester = await userIsTester(inputs.userId);
    let vegiAccount: sailsModelKVP<AccountType>;
    try {
      const vegiAccounts = await Account.find({
        id: inputs.accountId,
      });
      if (!vegiAccounts || vegiAccounts.length < 1) {
        sails.log.warn(
          `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper`
        );
        return exits.success({
          error: new Error(
            `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper`
          ),
          message: `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper`,
          success: false,
        });
      }
      vegiAccount = vegiAccounts[0];
    } catch (error) {
      sails.log.error(
        `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper with error: ${error}`
      );
      return exits.success({
        error: new Error(
          `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper with error: ${error}`
        ),
        message: `No account found for id: "${inputs.accountId}" in create-payment-intent-internal helper with error: ${error}`,
        success: false,
      });
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
        return exits.success({
          error: new Error(
            `No order found for id: "${inputs.orderId}" in create-payment-intent-internal helper`
          ),
          message: `No order found for id: "${inputs.orderId}" in create-payment-intent-internal helper`,
          success: false,
        });
      }
      order = orders[0];
    } catch (error) {
      sails.log.error(
        `No order found for id: "${inputs.orderId}" in create-payment-intent-internal helper with error: ${error}`
      );
      return exits.success({
        error: new Error(
          `No order found for id: "${inputs.orderId}" in create-payment-intent-internal helper with error: ${error}`
        ),
        message: `No order found for id: "${inputs.orderId}" in create-payment-intent-internal helper with error: ${error}`,
        success: false,
      });
    }

    let customer: Stripe.Customer | Stripe.DeletedCustomer; // ~ https://stripe.com/docs/api/accounts
    let setupIntent: Stripe.Response<Stripe.SetupIntent> | null = null;
    const stripeEnvName = isTester ? 'TEST' : 'LIVE';
    if (inputs.customerId) {
      try {
        customer = await stripe.customers.retrieve(inputs.customerId);
        sails.log.verbose(
          `Stripe [using ${stripeEnvName} env] customer RETRIEVED with id: "${
            customer.id
          }" and to be ensured sync with vegiAccount[${
            vegiAccount && vegiAccount.id
          }] from inputs.accountId: ${inputs.accountId}`
        );
      } catch (error) {
        if (`${error}`.includes('No such customer')){
          sails.log.verbose(
            `Recreate CustomerId for Account: "${inputs.accountId}" Failed to retrieve stripe from customerId: "${inputs.customerId}" with error: ${error}`
          );
        } else {
          const _error = Error(
            `Failed to retrieve stripe [using ${stripeEnvName} env] from customerId: "${inputs.customerId}" with error: ${error}`
          );
          sails.log.error(`${_error}`);
          await Account.update({ id: inputs.accountId }).set({
            stripeCustomerId: null,
          });
          return exits.success({
            error: _error,
            message: `Failed to retrieve stripe [using ${stripeEnvName} env] from customerId: "${inputs.customerId}" with error: ${error}`,
            success: false,
          });
        }
      }
    } 
    if(!customer) {
      try {
        customer = await stripe.customers.create();  
        sails.log.verbose(
          `Stripe [using ${stripeEnvName} env] customer CREATED with id: "${
            customer.id
          }" and to be added to vegiAccount[${
            vegiAccount && vegiAccount.id
          }] from inputs.accountId: ${inputs.accountId}`
        );
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
      } catch (error) {
        const _error = Error(
          `Failed to create stripe customer with error: ${error}`
        );
        sails.log.error(`${_error}`);
        await Account.update({ id: inputs.accountId }).set({
          stripeCustomerId: null,
        });
        return exits.success({
          error: _error,
          message: `Failed to create stripe customer with error: ${error}`,
          success: false,
        });
      }
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
        return exits.success({
          error: error,
          message: `Failed to update account in vegi with new stripe account id. Error: ${error}`,
          success: false,
        });
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
        return exits.success({
          error: new Error(`Cant make a stripe payment intent for PPL tokens.`),
          message: `Cant make a stripe payment intent for PPL tokens.`,
          success: false,
        });
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
        return exits.success({
          error: new Error(`Cant make a stripe payment intent for GBT tokens.`),
          message: `Cant make a stripe payment intent for GBT tokens.`,
          success: false,
        });
      } else {
        sails.log.error(
          `Cant make a stripe payment intent for [${inputCurrency}].`
        );
        return exits.success({
          error: new Error(
            `Cant make a stripe payment intent for [${inputCurrency}].`
          ),
          message: `Cant make a stripe payment intent for [${inputCurrency}].`,
          success: false,
        });
      }
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: inputAmountPence, //TODO get amounts from end point inputs...
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
          statement_descriptor:
            `vegi - [${inputs.vendorDisplayName}]` || 'vegi', // + ` (${})`,
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
        },
        {
          idempotencyKey: order.publicId, // ~ https://stripe.com/docs/api/idempotent_requests
        }
      );
      sails.log.verbose(
        `New payment intent: "${paymentIntent.id}" created for customer:[${customer.id}] and order[${order.id}]`
      );
      const paymentMethodsResponse = await stripe.customers.listPaymentMethods(
        customer.id
      );
      let paymentMethods = paymentMethodsResponse
        ? paymentMethodsResponse.data
        : [];
      if (paymentMethodsResponse && paymentMethodsResponse.has_more) {
        const morePaymentMethodsResponse =
          await stripe.customers.listPaymentMethods(customer.id, {
            starting_after: paymentMethods[paymentMethods.length].id,
          });
        if (morePaymentMethodsResponse && morePaymentMethodsResponse.data) {
          paymentMethods = [
            ...paymentMethods,
            ...morePaymentMethodsResponse.data,
          ];
        }
      }
      return exits.success({
        paymentIntent: paymentIntent,
        paymentMethods: paymentMethodsResponse && paymentMethodsResponse.data,
        setupIntent: setupIntent,
        ephemeralKey: ephemeralKey.secret, // used temporarily to allow client to fetch card details from client side stripe api and populate payment box
        customer:
          customer && !customer.deleted ? (customer as Stripe.Customer) : null,
        publishableKey: StripeKeys.publishableKey,
        success: true,
      });
    } catch (error) {
      sails.log.error(`${error}`);
      return exits.success({
        error: error,
        message: `${error}`,
        success: false,
      });
    }
  },
};

module.exports = _exports;
