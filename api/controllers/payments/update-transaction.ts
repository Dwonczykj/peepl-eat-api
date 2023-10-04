import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';
import util from 'util'

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  SailsDBError,
  TransactionType,
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Transaction: SailsModelType<TransactionType>;


export type UpdateTransactionInputs = {
  transactionId: number,
  remoteJobId?: string | undefined,
  status?: string | undefined,
  orderId?: number | undefined,
};

export type UpdateTransactionResponse =
  | {
      transaction: TransactionType | sailsModelKVP<TransactionType>;
    };

export type UpdateTransactionExits = {
  success: (unusedData: UpdateTransactionResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  UpdateTransactionInputs,
  UpdateTransactionResponse,
  UpdateTransactionExits
> = {
  friendlyName: 'UpdateTransaction',

  inputs: {
    transactionId: {
      type: 'number',
      required: true,
    },
    remoteJobId: {
      type: 'string',
      required: false,
    },
    status: {
      type: 'string',
      required: false,
    },
    orderId: {
      type: 'number',
      required: false,
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
    inputs: UpdateTransactionInputs,
    exits: UpdateTransactionExits
  ) {
    let queryResult: sailsModelKVP<TransactionType>;
    try {
      const queryResults = await Transaction.find({
        id: inputs.transactionId,
      });
      if(!queryResults || queryResults.length < 1){
        sails.log.error(`Unable to find any transactions for id: ${inputs.transactionId}`);
      } else {
        queryResult = queryResults[0];
      }
    } catch (_error) {
      const error: SailsDBError = _error;
      sails.log.error(`Failed to find Transactions with error: ${error.details}`);
      sails.log.error(util.inspect(error, {depth: 3}));
    }
    
    // todo: writ ethe update part ehre

    try {
      let args: any = {};
      if(inputs.orderId){
        args['orderId'] = inputs.orderId;
      }
      if(inputs.status){
        args['status'] = inputs.status;
      }
      if(inputs.remoteJobId){
        args['remoteJobId'] = inputs.remoteJobId;
      }
      await Transaction.updateOne({id: queryResult.id}).set(args);
    } catch (_error) {
      const error: SailsDBError = _error;
      sails.log.error(
        `Failed to update Transaction[${queryResult.id}] in create-fuse-payment-intent.ts with error: ${error.details}`
      );
    }
    queryResult = await Transaction.findOne({id: queryResult.id});
    return exits.success({
      transaction: queryResult,
    });
  },
};

module.exports = _exports;
