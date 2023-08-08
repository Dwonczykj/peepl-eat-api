
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';


import { Currency, convertCurrency } from '../../api/interfaces/peeplPay';
import { SailsActionDefnType } from '../../scripts/utils';


export type ConvertCurrencyAmountInputs = {
  amount: number;
  fromCurrency: Currency,
  toCurrency: Currency,
};

export type ConvertCurrencyAmountResponse = number;

export type ConvertCurrencyAmountExits = {
  success: (unusedData: ConvertCurrencyAmountResponse) => any;
};

const _exports: SailsActionDefnType<
  ConvertCurrencyAmountInputs,
  ConvertCurrencyAmountResponse,
  ConvertCurrencyAmountExits
> = {
  friendlyName: 'ConvertCurrencyAmount',

  inputs: {
    amount: {
      type: 'number',
      required: true,
    },
    fromCurrency: {
      type: 'string',
      required: true,
    },
    toCurrency: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: ConvertCurrencyAmountInputs,
    exits: ConvertCurrencyAmountExits
  ) {
    try {
      const amount = await convertCurrency(
        inputs.amount,
        inputs.fromCurrency,
        inputs.toCurrency
      );
      return exits.success(amount);
    } catch (error) {
      sails.log.error(`${error}`);
      return exits.success(0);
    }
  },
};

module.exports = _exports;
