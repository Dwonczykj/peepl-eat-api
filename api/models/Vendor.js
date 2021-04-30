/**
 * Vendor.js
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
      description: 'The name of the vendor.',
      required: true
    },
    type: {
      type: 'string',
      description: 'The type of vendor.',
      // isIn: ['restaurant', 'shop'],
      defaultsTo: 'restaurant',
      required: false
    },
    description: {
      type: 'string',
      description: 'A brief description of the vendor.',
      required: false
    },
    walletId: {
      type: 'string',
      description: 'The blockchain wallet address for the vendor. Used to distribute payments from customers.',
      required: true
    },
    imageFd: {
      type: 'string',
      description: 'A description of where the featured image file can be found'
    },
    imageMime: {
      type: 'string',
      description: 'The mime type of the featured image'
    },
    deliveryRestrictionDetails: {
      type: 'string',
      description: 'This is a free text description of the restaurant\'s restrictions, used temporarily.',
      allowNull: true
    },
    status: {
      type: 'string',
      isIn: ['active', 'draft', 'inactive'],
      defaultsTo: 'inactive'
    },
    phoneNumber: {
      type: 'string',
      description: 'Phone number of the restaurant.',
      allowNull: true
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    products: {
      collection: 'product',
      via: 'vendor'
    }
  },

};
