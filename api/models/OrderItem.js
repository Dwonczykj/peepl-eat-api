/**
 * OrderItem.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    unfulfilled: {
      type: 'boolean',
      defaultsTo: false,
      description: 'flag to show that item was unfulfilled from an order'
    },
    unfulfilledOnOrderId: {
      type: 'string',
      required: false,
      defaultsTo: '',
      description: 'Used to track the original order id of the parent order when an item is flagged as unfulfilled on an order, it is not removed from the order, it is just flagged as unfulfilled for tracking purposes. '
    },


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    order: {
      model: 'order',
      description: 'The order to which the item belongs',
      required: true
    },
    product: {
      model: 'product',
      description: 'The product which has been ordered.',
      required: true
    },
    optionValues: {
      collection: 'orderitemoptionvalue',
      via: 'orderItem'
    }

  },

};

