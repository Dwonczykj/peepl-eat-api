/**
 * End point for creating draft transactions to represent the intention of making a crypto transaction on fuse chain that we will confirm here later
 */
import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';
import util from 'util';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  AccountType,
  datetimeStrFormatExact,
  SailsActionDefnType,
  SailsDBError,
  TransactionType
} from '../../../scripts/utils';
import { error } from 'console';
import { Currency } from '../../interfaces';

declare var sails: sailsVegi;
declare var Transaction: SailsModelType<TransactionType>;
declare var Account: SailsModelType<AccountType>;


export type CreateFusePaymentIntentInputs = {
  payerWalletAddress: string,
  receiverWalletAddress: string,
  amountTokens: number,
  currency: string;
  metadata: object & {objectId?: number | null},
};

export type CreateFusePaymentIntentResponse = {
  transaction: TransactionType | sailsModelKVP<TransactionType>
};

export type CreateFusePaymentIntentExits = {
  success: (unusedData: CreateFusePaymentIntentResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  CreateFusePaymentIntentInputs,
  CreateFusePaymentIntentResponse,
  CreateFusePaymentIntentExits
> = {
  friendlyName: 'CreateFusePaymentIntent',

  description: 'End point for creating draft transactions to represent the intention of making a crypto transaction on fuse chain that we will confirm here later',

  inputs: {
    payerWalletAddress: {
      type: 'string',
      required: true,
    },
    receiverWalletAddress: {
      type: 'string',
      required: true,
    },
    amountTokens: {
      type: 'number',
      required: true,
    },
    currency: {
      type: 'string',
      required: true,
    },
    metadata: {
      type: 'ref',
      required: false,
      defaultsTo: {},
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
    inputs: CreateFusePaymentIntentInputs,
    exits: CreateFusePaymentIntentExits
  ) {
    if(inputs.amountTokens <= 0){
      return exits.badRequest(`Transactions must contain a strictly positive number of tokens, not: ${inputs.amountTokens} tokens`);
    }
    
    const getAccountForWallet = async (walletAddress: string) => {
      let queryResult: sailsModelKVP<AccountType>;
      try {
        const queryResults = await Account.find({
          walletAddress: walletAddress,
        });
        if(!queryResults || queryResults.length < 1){
          queryResult = await Account.create({
            accountType: 'ethereum',
            walletAddress: walletAddress,
            verified: false,
          }).fetch();
        } else {
          queryResult = queryResults[0];
        }
      } catch (_error) {
        const error: SailsDBError = _error;
        sails.log.error(`Failed to find or create an Account for wallet address: "${walletAddress}" with error: ${error.details}`);
      }
      return queryResult;
    };

    const payerAccount = await getAccountForWallet(inputs.payerWalletAddress);
    const receiverAccount = await getAccountForWallet(inputs.receiverWalletAddress);

    let newDraftTransaction: TransactionType;
    try {
      const _newObject = await Transaction.create({
        amount: Math.max(inputs.amountTokens, 0),
        currency: inputs.currency || Currency.GBT,
        payer: payerAccount.id,
        receiver: receiverAccount.id,
        timestamp: moment(moment.now()).format(datetimeStrFormatExact), //.format(datetimeStrFormatExactForSQLTIMESTAMP),
        status: 'draft',
        remoteJobId: '',
        order:
          (inputs.metadata &&
            inputs.metadata['objectId'] &&
            typeof inputs.metadata['objectId'] === 'number' &&
            inputs.metadata['objectId'] > 0) ||
          null,
      }).fetch();
      newDraftTransaction = _newObject;
    } catch (_error) {
      const error: SailsDBError = _error;
      sails.log.error(`Failed to create a Transaction in create-fuse-payment-intent.ts with error: ${error.details}`);
    }

    return exits.success({
      transaction: newDraftTransaction,
    });
  },
};

module.exports = _exports;
