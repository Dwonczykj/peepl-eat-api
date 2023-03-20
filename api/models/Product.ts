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
      maxLength: 255,
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
    vendorInternalId: {
      type: 'string',
      description: 'The Internal ID from the vendor',
      defaultsTo: '',
    },
    stockCount: {
      type: 'number',
      description: 'The remaining stock count for this product SKU',
      min: 0,
      columnType: 'INT',
      defaultsTo: 0,
    },
    supplier: {
      type: 'string',
      description: 'The name of the supplier i.e. Suma',
      defaultsTo: '',
    },
    brandName: {
      type: 'string',
      description: 'The name of the brand i.e. Jelly Bears',
      defaultsTo: '',
    },
    taxGroup: {
      type: 'string',
      description: 'An optional tax grouping such as STD VAT',
      defaultsTo: '',
    },
    stockUnitsPerProduct: {
      type: 'number',
      description:
        'Number of units per pack, i.e. a pack of 6 would have value of 6',
      defaultsTo: 1,
    },
    sizeInnerUnitValue: {
      type: 'number',
      description: 'i.e. 450 if 1 inner unit in the package is 450ml',
      defaultsTo: 0,
    },
    sizeInnerUnitType: {
      type: 'string',
      description:
        'A measure of the units used to describe the value of the size of 1 unit i.e. ml',
      defaultsTo: '',
    },
    productBarCode: {
      type: 'string',
      description:
        'A stringified long number, potentially GUID in future, that maps to the UPC (barcode) on the product',
      defaultsTo: '',
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

