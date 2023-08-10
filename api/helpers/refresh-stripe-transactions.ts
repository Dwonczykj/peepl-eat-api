import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';
import stripeFactory from '../../scripts/load_stripe';
import Stripe from 'stripe';
import { AccountType, OrderType, PaymentIntentMetaDataType, SailsActionDefnType, TransactionType } from '../../scripts/utils';
import {
  sailsModelKVP as SailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import { Currency } from '../../api/interfaces/peeplPay/currency';

declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;
declare var Transaction: SailsModelType<TransactionType>;
declare var Order: SailsModelType<OrderType>;

const checkCurrency = (currency:string) => {
  const currencyTickers = [
    'GBP',
    'USD',
    'EUR',
    'GBPX',
    'PPL',
  ];
  if(currencyTickers.indexOf(currency.toLocaleUpperCase()) < 0){
    return Currency.GBP;
  } else if(currency.toLocaleUpperCase() === 'GBPX'){
    return Currency.GBPx;
  }
  return currency.toLocaleUpperCase() as Currency;
};


export type RefreshStripeTransactionsInputs = {
  accountId: number;
  userId: number | null | undefined;
  transactionStatus?: string;
  dateBefore?: number;
  dateAfter?: number;
  orderId?: number;
  senderWalletAddress?: string;
  receiverWalletAddress?: string;
};

export type RefreshStripeTransactionsResult = TransactionType[] | false;

export type RefreshStripeTransactionsExits = {
  success: (unusedData: RefreshStripeTransactionsResult) => any;
};

const _exports: SailsActionDefnType<
  RefreshStripeTransactionsInputs,
  RefreshStripeTransactionsResult,
  RefreshStripeTransactionsExits
> = {
  friendlyName: 'RefreshStripeTransactions',

  inputs: {
    accountId: {
      type: 'number',
      required: false,
    },
    userId: {
      type: 'number',
      required: false,
    },
    transactionStatus: {
      type: 'string',
      required: false,
      defaultsTo: '',
      isIn: ['succeeded', 'all', 'failed', ''],
    },
    dateBefore: {
      type: 'number',
      required: false,
    },
    dateAfter: {
      type: 'number',
      required: false,
    },
    orderId: {
      type: 'number',
      required: false,
    },
    senderWalletAddress: {
      type: 'string',
      required: false,
    },
    receiverWalletAddress: {
      type: 'string',
      required: false,
    },

  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: RefreshStripeTransactionsInputs,
    exits: RefreshStripeTransactionsExits
  ) {
    const stripe = await stripeFactory(inputs.userId);
    let accounts: SailsModelKVP<AccountType>[] = [];
    if(inputs.accountId){
      accounts = await Account.find({
        id: inputs.accountId,
      });
    } else if(inputs.senderWalletAddress){
      accounts = await Account.find({
        walletAddress: inputs.senderWalletAddress as any,
      });
    }
    
    if((!accounts || accounts.length < 1) && inputs.accountId){
      sails.log.error(`No accounts found for account id: ${inputs.accountId} in helper: refresh-stripe-transactions`);
      return exits.success(false);
    }
     
    const vegiAccount = await Account.findOne({
      walletAddress: sails.config.custom.vegiWalletAddress,
    });

    if (!inputs.transactionStatus){
      inputs.transactionStatus = 'succeeded';
    }
    let query:string = '';
    if(inputs.transactionStatus !== 'all'){
      query += query === '' ? '' : ' AND ';
      query += `status:'${inputs.transactionStatus}'`;
    }
    if(inputs.orderId){
      query += query === '' ? '' : ' AND ';
      query += `metadata['orderId']:'${inputs.orderId}'`;
    }
    if(inputs.dateBefore){
      query += query === '' ? '' : ' AND ';
      query += `created<="${inputs.dateBefore}"`;
    }
    if(inputs.dateAfter){ // ~ https://stripe.com/docs/search#search-syntax
      query += query === '' ? '' : ' AND ';
      query += `created>="${inputs.dateAfter}"`;
    }

    let paymentIntent: Stripe.Response<Stripe.ApiSearchResult<Stripe.PaymentIntent>>;
    let transactions: TransactionType[];
    if(accounts.length > 0){
      if (accounts[0].accountType !== 'bank'){
        query += query === '' ? '' : ' AND ';
        query += `metadata['senderWalletAddress']:'${accounts[0].walletAddress}'`;
      } else {
        query += query === '' ? '' : ' AND ';
        query += `metadata['accountId']:'${accounts[0].id}'`;
      }
    }
    paymentIntent = await stripe.paymentIntents.search({
      query: query,
    });
    for (const pi of paymentIntent.data) {
      const meta: PaymentIntentMetaDataType = pi.metadata as any;
      let payerAccountId: number;
      let receiverAccountId: number;
      if(accounts.length > 0){
        payerAccountId = accounts[0].id;
        receiverAccountId = vegiAccount.id;
      } else {
        payerAccountId = meta['accountId'];
        receiverAccountId = vegiAccount.id;
      }
      
      const existingTransactions = await Transaction.find({
        amount: pi.amount,
        currency: checkCurrency(pi.currency.toLocaleUpperCase()),
        payer: payerAccountId,
        receiver: vegiAccount.id,
        timestamp: pi.created,
        order: meta['orderId'],
      }).populate('payer&order');
      if (!existingTransactions || existingTransactions.length < 1) {
        try {
          if(!payerAccountId){
            // todo: Was there an order for the same amount at that time?
            const likelyOrders = await Order.find({
              or: [
                {paidDateTime: pi.created},
                {orderedDateTime: pi.created},
              ],
            });
            let account:SailsModelKVP<AccountType> | null = null;
            if(likelyOrders && likelyOrders.length > 0){
              accounts = await Account.find({
                walletAddress: likelyOrders[0].customerWalletAddress
              });
              if (accounts && accounts.length > 0){
                account = accounts[0];
              }
            }
            if (account){
              payerAccountId = account.id;
            } else if(!pi.livemode){
              sails.log(`Ignoring paymentIntent for ${pi.currency.toLocaleUpperCase()} ${(pi.amount/100).toFixed(2)} for customer [${pi.customer}] at ${moment.utc(pi.created*1000).format('DD/MM/yyyy hh:mm:ss')} as in test mode!`);
            } else {
              return exits.success(false);
            }
          }
          const newTransaction = await Transaction.create({
            amount: pi.amount,
            currency: checkCurrency(pi.currency.toLocaleUpperCase()),
            payer: payerAccountId,
            receiver: vegiAccount.id,
            timestamp: pi.created,
            status: 'succeeded',
            remoteJobId: null,
          }).fetch();
          transactions.push(newTransaction);
        } catch (error) {
          sails.log.error(`Threw trying to create Transaction from paymentIntent. Error: ${error}`);
          sails.log.error(JSON.stringify(pi, null, 4));
          return exits.success(false);
        }
      } else {
        transactions = [...transactions, ...existingTransactions];
      }
    }
    return exits.success(transactions);
  },
};

module.exports = _exports;
