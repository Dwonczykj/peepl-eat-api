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
    deliveryAddressLineOne: {
      type: 'string',
      description: 'The first line of the delivery address.'
    },
    deliveryAddressLineTwo: {
      type: 'string',
      description: 'The second line of the delivery address.'
    },
    deliveryAddressPostCode: {
      type: 'string',
      description: 'The post code of the delivery address.'
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

