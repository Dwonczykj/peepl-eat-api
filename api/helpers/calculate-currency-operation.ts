import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  SailsActionDefnType,
} from '../../scripts/utils';
import { Currency } from '../../api/interfaces/peeplPay';

declare var sails: sailsVegi;



export type CalculateCurrencyOperationInputs = {
  leftCurrency: Currency;
  leftAmount: number;
  rightCurrency: Currency;
  rightAmount: number;
  operation:  'add' | 'subtract';
};

export type CalculateCurrencyOperationResponse = {
  currency: Currency;
  amount: number;
} | false;

export type CalculateCurrencyOperationExits = {
  success: (unusedData: CalculateCurrencyOperationResponse) => any;
};

const _exports: SailsActionDefnType<
  CalculateCurrencyOperationInputs,
  CalculateCurrencyOperationResponse,
  CalculateCurrencyOperationExits
> = {
  friendlyName: 'CalculateCurrencyOperation',

  inputs: {
    leftCurrency: {
      type: 'string',
      required: true,
    },
    leftAmount: {
      type: 'number',
      required: true,
    },
    rightCurrency: {
      type: 'string',
      required: true,
    },
    rightAmount: {
      type: 'number',
      required: true,
    },
    operation: {
      type: 'string',
      required: true,
      isIn: ['add', 'subtract'],
    }
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: CalculateCurrencyOperationInputs,
    exits: CalculateCurrencyOperationExits
  ) {
    if(inputs.leftAmount === 0){
      return exits.success({
        currency: inputs.leftCurrency,
        amount: inputs.rightAmount,
      });
    }
    if(inputs.rightAmount === 0){
      return exits.success({
        currency: inputs.leftCurrency,
        amount: inputs.leftAmount,
      });
    }
    
    try {
      let rightAmountInLeftCurrency = inputs.rightAmount;
      if (inputs.leftCurrency !== inputs.rightCurrency) {
        rightAmountInLeftCurrency =
           await sails.helpers.convertCurrencyAmount.with({
             amount: inputs.rightAmount,
             fromCurrency: inputs.rightCurrency,
             toCurrency: inputs.leftCurrency,
           });
      }
      
      if (inputs.operation === 'add') {
        return exits.success({
          currency: inputs.leftCurrency,
          amount: inputs.leftAmount + rightAmountInLeftCurrency,
        });
      } else {
        return exits.success({
          currency: inputs.leftCurrency,
          amount: inputs.leftAmount - rightAmountInLeftCurrency,
        });
      }
    } catch (error) {
      sails.log.error(error);
      return exits.success(false);
    }
  },
};

module.exports = _exports;
