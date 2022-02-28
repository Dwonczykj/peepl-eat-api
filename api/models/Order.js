/**
 * Order.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    total: {
      type: 'number',
      description: 'The order total in pence.',
      required: true
    },
    orderedDateTime: {
      type: 'number',
      description: 'The unixtime when the order was placed.',
      required: true
    },
    paidDateTime: {
      type: 'number',
      description: 'The unixtime when the order payment was confirmed (if at all).',
      required: false
    },
    deliveryName: {
      type: 'string',
      description: 'The name for the delivery.',
      required: true
    },
    deliveryEmail: {
      type: 'string',
      description: 'The email for the delivery.',
      isEmail: true,
      required: true
    },
    deliveryPhoneNumber: {
      type: 'string',
      description: 'The phone number for the delivery.',
      required: true
    },
    deliveryAddressLineOne: {
      type: 'string',
      description: 'The first line of the delivery address.',
      required: true
    },
    deliveryAddressLineTwo: {
      type: 'string',
      description: 'The second line of the delivery address.',
    },
    deliveryAddressPostCode: {
      type: 'string',
      description: 'The post code of the delivery address.',
      required: true,
      regex: /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/i
    },
    deliveryAddressInstructions: {
      type: 'string',
      description: 'Details about how/where to deliver the order.',
      maxLength: 200
    },
    customerWalletAddress: {
      type: 'string',
      description: 'The wallet address of the customer.'
    },
    paymentStatus: {
      type: 'string',
      defaultsTo: 'unpaid'
    },
    paymentIntentId: {
      type: 'string'
    },
    isArchived: {
      type: 'boolean',
      defaultsTo: false
    },
    deliveryId: {
      type: 'string',
      description: 'The ID to identify the delivery in the logistics system'
    },
    fulfilmentSlotFrom: {
      type: 'ref',
      columnType: 'datetime',
      description: 'The beginning of the estimated fulfilment slot.'
    },
    fulfilmentSlotTo: {
      type: 'ref',
      columnType: 'datetime',
      description: 'The end of the estimated fulfilment slot.'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    // customer: {
    //   model: 'user',
    //   required: true
    // },
    fulfilmentMethod: {
      model: 'fulfilmentmethod'
    },
    discount: {
      model: 'discount'
    },
    items: {
      collection: 'orderitem',
      via: 'order'
    },
    vendor: {
      model: 'vendor',
      required: true
    },

  },

};
