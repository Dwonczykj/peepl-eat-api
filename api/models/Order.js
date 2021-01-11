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
      type: 'string',
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
      // required: true
    },
    deliveryAddressPostCode: {
      type: 'string',
      description: 'The post code of the delivery address.',
      required: true
    },
    customerWallet: {
      type: 'string'
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
    items: {
      collection: 'orderitem',
      via: 'order'
    }

  },

};

