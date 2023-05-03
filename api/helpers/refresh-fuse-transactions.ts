import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { SailsActionDefnType } from '../../scripts/utils';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  TransactionType
} from '../../scripts/utils';

declare var sails: sailsVegi;
declare var Transaction: SailsModelType<TransactionType>;


export type RefreshFuseTransactionsInputs = {
  accountId: number;
  transactionStatus?: string;
  dateBefore?: number;
  dateAfter?: number;
  orderId?: number;
  senderWalletAddress?: string;
  receiverWalletAddress?: string;
};

export type RefreshFuseTransactionsResult = TransactionType[] | false;

export type RefreshFuseTransactionsExits = {
  success: (unusedData: RefreshFuseTransactionsResult) => any;
};

const _exports: SailsActionDefnType<
  RefreshFuseTransactionsInputs,
  RefreshFuseTransactionsResult,
  RefreshFuseTransactionsExits
> = {
  friendlyName: 'Transaction',

  inputs: {
    accountId: {
      type: 'number',
      required: true,
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
    inputs: RefreshFuseTransactionsInputs,
    exits: RefreshFuseTransactionsExits
  ) {
    

    return exits.success(false);
  },
};

module.exports = _exports;
