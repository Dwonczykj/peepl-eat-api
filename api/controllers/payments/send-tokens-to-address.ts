import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  UserType
} from '../../../scripts/utils';
import { generateCorrelationId, mintTokensToAddress } from '../../../fuse/fuseApi';

declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;


export type SendTokensToAddressInputs = {
  toAddress: string,
  amount: number,

};

export type SendTokensToAddressResponse = {
  
};

export type SendTokensToAddressExits = {
  success: (unusedData: SendTokensToAddressResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String | any) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  SendTokensToAddressInputs,
  SendTokensToAddressResponse,
  SendTokensToAddressExits
> = {
  friendlyName: 'SendTokensToAddress',

  inputs: {
    toAddress: {
      type: 'string',
      required: true,
    },
    amount: {
      type: 'number',
      required: true,
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
    inputs: SendTokensToAddressInputs,
    exits: SendTokensToAddressExits
  ) {
    if(inputs.amount < 0) {
      sails.log.warn('Can\'t send negative amounts of GBT');
      return exits.badRequest('Can\'t send negative amounts of GBT');
    } else if(inputs.amount > 500) {
      sails.log.warn('Can\'t send amounts of GBT above 500');
      return exits.badRequest('Can\'t send amounts of GBT above 500');
    }

    sails.log.verbose(`Minting ${inputs.amount} to "${inputs.toAddress}" 💰!`);
    const correlationId = generateCorrelationId();
    try {
      // void call:
      const results =
        await mintTokensToAddress({
          toAddress: inputs.toAddress,
          amount: (inputs.amount / 100).toString(),
          correlationId: correlationId,
          orderId: null,
        });
      if(!results.error){
        return exits.success(results);
      } else {
        return exits.error(results);
      }
    } catch (error) {
      sails.log.error(
        `Unable to mint ${inputs.amount} Tokens to "${inputs.toAddress}" with error: ${error}`
      );
      return exits.error(
        `Unable to mint ${inputs.amount} Tokens to "${inputs.toAddress}" with error: ${error}`
      );
    }
  },
};

module.exports = _exports;
