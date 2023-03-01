/**
 * OptionValue.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

import {
  ProductOptionValueType,
  SailsModelDefnType,
} from '../../scripts/utils';

let _exports: SailsModelDefnType<ProductOptionValueType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: 'string',
      description: 'The name of the option value (e.g. Blue)',
      required: true,
    },
    description: {
      type: 'string',
      description:
        'The description of the option value (e.g. This is a great sky blue shade!)',
      required: false,
    },
    priceModifier: {
      type: 'number',
      description:
        'The amount of pence to add or subtract from the product total for this option.',
      required: false,
    },
    isAvailable: {
      type: 'boolean',
      description: 'Represents whether or not the option value is available.',
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
    option: {
      model: 'productoption',
      // via: 'values',
      description: 'The option to which this value can apply.',
    },
  },
};

module.exports = _exports;
