/**
 * Order.ts
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
import {v4 as uuidv4} from 'uuid';

import {
  SailsModelDefnType,
  OrderType,
} from '../../scripts/utils';

let _exports: SailsModelDefnType<OrderType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    subtotal: {
      type: 'number',
      description: 'The subtotal of the order.',
    },
    total: {
      type: 'number',
      description: 'The order total in pence.',
      required: true,
    },
    currency: {
      type: 'string',
      required: true,
      // defaultsTo: Currency.GBPx, //'GBPx'
    },
    orderedDateTime: {
      type: 'number',
      description: 'The unixtime when the order was placed.',
      required: true,
    },
    paidDateTime: {
      type: 'number',
      description: 'The unixtime when the order payment was paid (if at all).',
      required: false,
      allowNull: true,
    },
    refundDateTime: {
      type: 'number',
      description:
        'The unixtime when the order payment was refunded (if at all).',
      required: false,
      allowNull: true,
    },
    deliveryName: {
      type: 'string',
      description: 'The name for the delivery.',
      required: true,
    },
    deliveryEmail: {
      type: 'string',
      description: 'The email for the delivery.',
      isEmail: true,
      required: true,
    },
    deliveryPhoneNumber: {
      type: 'string',
      description: 'The phone number for the delivery.',
      required: true,
    },
    deliveryAddressLineOne: {
      type: 'string',
      description: 'The first line of the delivery address.',
      required: true,
    },
    deliveryAddressLineTwo: {
      type: 'string',
      description: 'The second line of the delivery address.',
    },
    deliveryAddressCity: {
      type: 'string',
      description: 'The city of the delivery address.',
    },
    deliveryAddressPostCode: {
      type: 'string',
      description: 'The post code of the delivery address.',
      required: true,
      regex:
        /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/i,
    },
    deliveryAddressInstructions: {
      type: 'string',
      description: 'Details about how/where to deliver the order.',
      maxLength: 200,
    },
    deliveryAddressLatitude: {
      type: 'number',
      allowNull: true,
    },
    deliveryAddressLongitude: {
      type: 'number',
      allowNull: true,
    },
    customerWalletAddress: {
      type: 'string',
      description: 'The wallet address of the customer.',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/,
    },
    paymentStatus: {
      type: 'string',
      defaultsTo: 'unpaid',
      isIn: ['unpaid', 'paid', 'failed'],
    },
    paymentIntentId: {
      type: 'string',
    },
    firebaseRegistrationToken: {
      type: 'string',
      required: false,
      description:
        'Used to send notificaitons to devices that are registered to this order',
      allowNull: true,
    },
    // isArchived: {
    //   type: 'boolean',
    //   defaultsTo: false
    // },
    deliveryId: {
      type: 'string',
      description: 'The ID to identify the delivery in the logistics system',
    },
    deliveryPartnerAccepted: {
      type: 'boolean',
      defaultsTo: false,
    },
    deliveryPartnerConfirmed: {
      type: 'boolean',
      defaultsTo: false,
    },
    fulfilmentSlotFrom: {
      type: 'ref',
      // columnType: 'datetime',
      columnType: 'timestamp',
      description: 'The beginning of the estimated fulfilment slot.',
    },
    fulfilmentSlotTo: {
      type: 'ref',
      // columnType: 'datetime',
      columnType: 'timestamp',
      description: 'The end of the estimated fulfilment slot.',
    },
    publicId: {
      type: 'string',
    },
    tipAmount: {
      type: 'number',
      description: 'Amount of tip in pence',
      min: 0,
    },
    restaurantAcceptanceStatus: {
      type: 'string',
      defaultsTo: 'pending',
      isIn: [
        'pending',
        'accepted',
        'rejected',
        'partially fulfilled',
        'cancelled by user',
      ],
    },
    orderAcceptanceStatus: {
      type: 'string',
      defaultsTo: 'pending',
      isIn: [
        'pending',
        'accepted',
        'rejected',
        'cancelled by user',
        'partially fulfilled',
        'out for delivery',
        'delivered',
        'collected',
      ],
    },
    rewardsIssued: {
      type: 'number',
      defaultsTo: 0,
    },
    sentToDeliveryPartner: {
      type: 'boolean',
      defaultsTo: false,
    },
    completedFlag: {
      type: 'string',
      defaultsTo: '',
      isIn: [
        '',
        'none',
        'completed',
        'cancelled',
        'refunded',
        'partially refunded',
        'voided',
      ],
    },
    completedOrderFeedback: {
      type: 'string',
      allowNull: true,
    },
    deliveryPunctuality: {
      type: 'number',
      columnType: 'int4',
      min: 0,
      max: 5,
      allowNull: true,
    },
    orderCondition: {
      type: 'number',
      columnType: 'int4',
      min: 0,
      max: 5,
      allowNull: true,
    },
    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    fulfilmentMethod: {
      model: 'fulfilmentmethod',
      required: true,
    },
    // discount: {
    //   model: 'discount',
    // },
    discounts: {
      collection: 'discount',
      via: 'orders',
      description: 'all discouns that have been applied to this order',
    },
    items: {
      collection: 'orderitem',
      via: 'order',
    },
    unfulfilledItems: {
      collection: 'orderitem',
      via: 'order',
    },
    vendor: {
      model: 'vendor',
      required: true,
    },
    deliveryPartner: {
      model: 'deliverypartner',
    },
    parentOrder: {
      model: 'order',
      required: false,
    },
  },

  beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.publicId = uuidv4();
    return proceed();
  },
};

module.exports = _exports;
