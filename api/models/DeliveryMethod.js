/**
 * DeliveryMethod.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: 'string',
      description: 'The name of the delivery method.',
      required: true
    },
    description: {
      type: 'string',
      description: 'A brief description of the shipping method.',
    },
    priceModifier: {
      type: 'number',
      description: 'A positive or negative integer representing the amount of pence to adjust the base price by.'
    },
    postCodeRestrictionRegex: {
      type: 'string',
      description: 'A regular expression specifying which postcodes are eligible for this delivery method.'
    },
    methodType: {
      type: 'string',
      isIn: ['courier', 'collection'],
      defaultsTo: 'courier'
    },


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    products: {
      collection: 'product',
      via: 'deliveryMethods'
    },
    deliveryMethodSlots: {
      collection: 'deliverymethodslot',
      via: 'deliveryMethod'
    }
  },

};

