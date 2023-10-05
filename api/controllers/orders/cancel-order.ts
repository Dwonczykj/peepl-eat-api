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

declare var sails: sailsVegi;
declare var Order: SailsModelType<OrderType>;


export type CancelOrderInputs = {
  orderId: number,
  senderWalletAddress: string,
};

export type CancelOrderResponse = sailsModelKVP<OrderType> | false;

export type CancelOrderExits = {
  success: (unusedData: CancelOrderResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
  orderHasFulfilmentSlotInPast: (unusedErr: Error | String) => void;
  orderNotPending: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  CancelOrderInputs,
  CancelOrderResponse,
  CancelOrderExits
> = {
  friendlyName: 'CancelOrder',

  inputs: {
    orderId: {
      type: 'number',
      required: true,
    },
    senderWalletAddress: {
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
    orderHasFulfilmentSlotInPast: {
      statusCode: 400,
      data: null,
    },
    orderNotPending: {
      statusCode: 400,
      data: null,
    },
  },

  fn: async function (
    inputs: CancelOrderInputs,
    exits: CancelOrderExits
  ) {
    const order = await Order.findOne({
      id: inputs.orderId,
      customerWalletAddress: inputs.senderWalletAddress,
    }).populate('vendor');
    const slotTo = moment.utc(order.fulfilmentSlotTo, 'YYYY-MM-DD HH:mm:ss');
    if (slotTo.isBefore(moment.utc())) {
      const nowFormatted = moment.utc().format('YYYY-MM-DD HH:mm:ss');
      return exits.orderHasFulfilmentSlotInPast(
        `[${nowFormatted}] -> Order delivery slot already passed at ${order.fulfilmentSlotTo}.`,
      );
    }

    if (!order) {
      sails.log.info('cancel-order - order NOT found');
      return exits.notFound();
    } else {
      sails.log.info(`Cancel order [${order.id}]`);
    }

    if (order.restaurantAcceptanceStatus !== 'pending') {
      // Restaurant has previously accepted or declined the order, they cannot modify the order acceptance after this.
      return exits.orderNotPending(`Cannot cancel order as order[${order.id}] is not draft, it is "${order.restaurantAcceptanceStatus}"`);
    }

    await Order.updateOne(order.id).set({
      completedFlag: 'cancelled',
      restaurantAcceptanceStatus: 'cancelled by user',
      orderAcceptanceStatus: 'cancelled by user',
    });
    if (order.completedFlag !== 'none' && order.completedFlag !== '') {
      if (order.paymentStatus === 'paid') {
        sails.log.warn(
          'TODO: Process automatic order refunds from cancel-order action when the order has the paymentStatus of "paid"'
        );
      } else {
        sails.log.warn(
          `Cancelled order[${order.id}] that had a completedFlag of: "${order.completedFlag}"`
        );
      }
      // Send notification to customer that their order has been accepted/declined.
      const vendorName = order.vendor ? ` from ${order.vendor.name}` : '';
      if (order.paymentStatus !== 'unpaid') {
        await sails.helpers.broadcastFirebaseNotificationForTopic.with({
          topic: 'order-' + order.publicId,
          title: 'Order update',
          body: `Your order${vendorName} has been cancelled.`,
          data: {
            orderId: inputs.orderId.toString(),
          },
        });
        await sails.helpers.sendSmsNotification.with({
          to: order.deliveryPhoneNumber,
          body: `Order cancelled${vendorName}!`,
          data: {
            orderId: order.id.toString(),
          },
        });
      }
    }

    const updatedOrder = await Order.findOne({
      id: order.id
    });
    
    return exits.success(updatedOrder);
  },
};

module.exports = _exports;
