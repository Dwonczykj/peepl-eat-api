/**
 * Product.js
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
      required: true
    },
    description: {
      type: 'string',
      required: false
    },
    basePrice: {
      type: 'number',
      description: 'Base product price in pence. This can be modified by product options or delivery methods.',
      required: true
    },
    image: {
      type: 'string',
      description: 'Full path to the product image.'
    },
    isAvailable: {
      type: 'boolean',
      description: 'Boolean to represent whether the product is available or not.'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
      description: 'The seller of the product.',
      required: true
    },
    options: {
      collection: 'productoption',
      via: 'product',
      description: 'A collection of options that apply to the product (i.e. colour).'
    },
    deliveryMethods: {
      collection: 'deliverymethod',
      via: 'products',
      description: 'The delivery methods applicable to this product.'
    }

  },

};

