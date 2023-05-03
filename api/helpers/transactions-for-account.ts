import stripe from '../../scripts/load_stripe';
import Stripe from 'stripe';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { PaymentIntentMetaDataType, SailsActionDefnType } from '../../scripts/utils';
import { sailsModelKVP, SailsModelType, sailsVegi } from '../interfaces/iSails';
import { TransactionType, AccountType } from '../../scripts/utils';
import { Currency } from '../../api/interfaces/peeplPay';

declare var sails: sailsVegi;
declare var Transaction: SailsModelType<TransactionType>;
declare var Account: SailsModelType<AccountType>;

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
  return Currency[currency.toLocaleUpperCase()];
};

export type TransactionsForAccountInputs = {
  accountId: number;
  // party: 'payer' | 'receiver';
  transactionStatus: '' | 'succeeded' | 'all' | 'failed';
};

export type TransactionsForAccountResult =
  | TransactionType[]
  | false;

export type TransactionsForAccountExits = {
  success: (unusedData: TransactionsForAccountResult) => any;
};

const _exports: SailsActionDefnType<
  TransactionsForAccountInputs,
  TransactionsForAccountResult,
  TransactionsForAccountExits
> = {
  friendlyName: 'Transaction',

  inputs: {
    accountId: {
      type: 'number',
      required: true,
    },
    // party: {
    //   type: 'string',
    //   required: true,
    //   isIn: ['payer', 'receiver'],
    // },
    transactionStatus: {
      type: 'string',
      required: false,
      defaultsTo: '',
      isIn: ['succeeded', 'all', 'failed', ''],
    } 
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: TransactionsForAccountInputs,
    exits: TransactionsForAccountExits
  ) {
    const accounts = await Account.find({
      id: inputs.accountId,
    });
    const vegiAccount = await Account.findOne({
      walletAddress: sails.config.custom.vegiWalletAddress,
    });
    if(!accounts || accounts.length < 1){
      sails.log.error(`No accounts found for account id: ${inputs.accountId} in helper: transactions-for-account`);
      return exits.success(false);
    }
    if (!inputs.transactionStatus){
      inputs.transactionStatus = 'succeeded';
    }
    const account = accounts[0];
    let transactions: TransactionType[];
    let paymentIntent: Stripe.Response<Stripe.ApiSearchResult<Stripe.PaymentIntent>>;
    //TODO: If account is a wallet Address, Query fuse explorer for transactions with that walletId
    if (account.accountType !== 'bank'){
      if(inputs.transactionStatus !== 'all'){
        paymentIntent = await stripe.paymentIntents.search({
          query: `status:'${inputs.transactionStatus}' AND metadata['senderWalletAddress']:'${account.walletAddress}'`,
        });
      } else {
        paymentIntent = await stripe.paymentIntents.search({
          query: `metadata['senderWalletAddress']:'${account.walletAddress}'`,
        });
      }
    } else {
      // * account is a bank account type
      if (inputs.transactionStatus !== 'all') {
        paymentIntent = await stripe.paymentIntents.search({
          query: `status:'${inputs.transactionStatus}' AND metadata['accountId']:'${account.id}'`,
        });
      } else {
        paymentIntent = await stripe.paymentIntents.search({
          query: `metadata['accountId']:'${account.id}'`,
        });
      }
    }
    for (const pi of paymentIntent.data){
      const meta: PaymentIntentMetaDataType = pi.metadata as any;
      const existingTransactions = await Transaction.find({
        amount: pi.amount,
        currency: checkCurrency(pi.currency.toLocaleUpperCase()),
        payer: account.id,
        receiver: vegiAccount.id,
        timestamp: pi.created,
        order: meta['orderId'],
      }).populate('payer&order');
      if (!existingTransactions || existingTransactions.length < 1){
        const newTransaction = await Transaction.create({
          amount: pi.amount,
          currency: checkCurrency(pi.currency.toLocaleUpperCase()),
          payer: account.id,
          receiver: vegiAccount.id,
          timestamp: pi.created,
        }).fetch();
        transactions.push(newTransaction);
      } else {
        transactions = [
          ...transactions,
          ...existingTransactions,
        ];
      }
    }
    return exits.success(transactions);
  },
};

module.exports = _exports;
