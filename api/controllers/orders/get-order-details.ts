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
  OrderType
} from '../../../scripts/utils';
import { FormattedOrderForClients } from '../../../api/helpers/format-orders';

declare var sails: sailsVegi;
declare var Order: SailsModelType<OrderType>;


export type GetOrderDetailsInputs = {
  orderId: number,
};

export type GetOrderDetailsResponse =
  | {
      order: FormattedOrderForClients;
    }
  | false;

export type GetOrderDetailsExits = {
  success: (unusedData: GetOrderDetailsResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  GetOrderDetailsInputs,
  GetOrderDetailsResponse,
  GetOrderDetailsExits
> = {
  friendlyName: 'GetOrderDetails',

  inputs: {
    orderId: {
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
    inputs: GetOrderDetailsInputs,
    exits: GetOrderDetailsExits
  ) {
    const order = await Order.findOne(inputs.orderId).populate(
      'fulfilmentMethod&discount&deliveryPartner&vendor&items&items.product'
    );

    if(!order) {
      return exits.notFound();
    }

    const formattedOrders = await sails.helpers.formatOrders.with({
      orders: [order],
    });

    const formattedOrder = formattedOrders && formattedOrders.orders[0];

    // All done.
    return exits.success({order: formattedOrder});
  },
};

module.exports = _exports;
