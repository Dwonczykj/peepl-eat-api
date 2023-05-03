import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  SailsModelType,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  OrderType,
  PaymentStatusType,
  RestaurantAcceptedStatusType,
  OrderAcceptedStatusType
} from '../../../scripts/utils';

declare var Order: SailsModelType<OrderType>;


export type GetOrderStatusInputs = {
  orderId: number,
};

export type GetOrderStatusResponse = {
  paymentStatus: PaymentStatusType,
  restaurantAcceptanceStatus: RestaurantAcceptedStatusType,
  orderAcceptanceStatus: OrderAcceptedStatusType,
} | false;

export type GetOrderStatusExits = {
  success: (unusedData: GetOrderStatusResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  GetOrderStatusInputs,
  GetOrderStatusResponse,
  GetOrderStatusExits
> = {
  friendlyName: 'GetOrderStatus',

  inputs: {
    orderId: {
      type: 'number',
      description: 'ID of the order',
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
    inputs: GetOrderStatusInputs,
    exits: GetOrderStatusExits
  ) {
    var order = await Order.findOne({id: inputs.orderId});

    if(!order){
      return exits.notFound();
    }

    return exits.success({
      paymentStatus: order.paymentStatus, 
      restaurantAcceptanceStatus: order.restaurantAcceptanceStatus,
      orderAcceptanceStatus: order.orderAcceptanceStatus,
    });
  },
};

module.exports = _exports;
