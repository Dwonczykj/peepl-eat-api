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
      required: true,
      maxLength: 50
    },
    description: {
      type: 'string',
      required: false
    },
    shortDescription: {
      type: 'string',
      maxLength: 300,
    },
    basePrice: {
      type: 'number',
      description: 'Base product price in pence. This can be modified by product options or delivery methods.',
      required: true
    },
    imageUrl: {
      type: 'string',
    },
    isAvailable: {
      type: 'boolean',
      description: 'Boolean to represent whether the product is available or not.'
    },
    priority: {
      type: 'number',
      description: 'Temporary way to store priority of products'
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
    category: {
      model: 'productcategory',
      description: 'The category of the product.',
    },

  },

};

