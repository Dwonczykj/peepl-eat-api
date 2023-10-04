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
  OrderType,
  SailsDBError
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Order: SailsModelType<OrderType>;


export type UpdateOrderStatusInputs = {
  orderId: OrderType['id'],
  paymentStatus: OrderType['paymentStatus'],
};

export type UpdateOrderStatusResponse = {
  order: sailsModelKVP<OrderType>;
};

export type UpdateOrderStatusExits = {
  success: (unusedData: UpdateOrderStatusResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: (unusedErr: Error | String) => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  UpdateOrderStatusInputs,
  UpdateOrderStatusResponse,
  UpdateOrderStatusExits
> = {
  friendlyName: 'UpdateOrderStatus',

  inputs: {
    orderId: {
      type: 'number',
      required: true,
    },
    paymentStatus: {
      type: 'string',
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
    inputs: UpdateOrderStatusInputs,
    exits: UpdateOrderStatusExits
  ) {
    if(process.env.NODE_ENV === 'production'){
      return exits.badRequest(`Can't call the update order status action in node_env other than for development.`);
    }

    let queryResult: sailsModelKVP<OrderType>;
    try {
      const queryResults = await Order.find({
        id: inputs.orderId
      })
      if(!queryResults || queryResults.length < 1){
        return exits.notFound(`No order found for id: ${inputs.orderId}`);
      } else {
        queryResult = queryResults[0];
      }
    } catch (_error) {
      const error: SailsDBError = _error;
      sails.log.error(`Failed to find orders with error: ${error.details}`);
      sails.log.error(util.inspect(error, {depth: 3}));
    }
    
    return exits.success({
      order: queryResult,
    });
    
  },
};

module.exports = _exports;
