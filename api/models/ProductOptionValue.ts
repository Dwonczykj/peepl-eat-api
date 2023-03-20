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
