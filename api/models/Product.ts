/**
 * Product.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

import {
  ProductType,
  SailsModelDefnType,
} from '../../scripts/utils';

let _exports: SailsModelDefnType<ProductType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    description: {
      type: 'string',
      required: false,
    },
    shortDescription: {
      type: 'string',
      maxLength: 300,
    },
    basePrice: {
      type: 'number',
      description:
        'Base product price in pence. This can be modified by product options or delivery methods.',
      required: true,
    },
    imageUrl: {
      type: 'string',
    },
    isAvailable: {
      type: 'boolean',
      description:
        'Boolean to represent whether the product is available or not.',
    },
    priority: {
      type: 'number',
      description: 'Temporary way to store priority of products',
    },
    isFeatured: {
      type: 'boolean',
      description:
        'Boolean to represent whether the product is featured or not.',
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'inactive',
      description:
        'string active|inactive to represent whether product is discontinued or not',
    },
    ingredients: {
      type: 'string',
      columnType: 'LONGTEXT',
      required: false,
      allowNull: true,
      description: 'back of the package information',
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
      required: true,
    },
    options: {
      collection: 'productoption',
      via: 'product',
      description:
        'A collection of options that apply to the product (i.e. colour).',
    },
    category: {
      model: 'productcategory',
      description: 'The category of the product.',
    },
  },
};

module.exports = _exports;

