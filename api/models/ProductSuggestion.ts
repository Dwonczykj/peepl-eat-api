/**
 * ProductSuggestion.ts
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

import { ProductSuggestionType, SailsModelDefnType } from '../../scripts/utils';

let _exports: SailsModelDefnType<ProductSuggestionType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: 'string',
      description: 'The name of the option value (e.g. Blue)',
      required: true,
    },
    additionalInformation: {
      type: 'string',
      required: false,
    },
    store: {
      type: 'string',
      required: false,
    },
    productProcessed: {
      type: 'boolean',
      defaultsTo: false,
      required: false,
    },
    qrCode: {
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
    imageUrls: {
      collection: 'productsuggestionimage',
      via: 'productSuggestion',
    },
  },
};

module.exports = _exports;
