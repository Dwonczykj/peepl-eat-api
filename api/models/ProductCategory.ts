/**
 * ProductCategory.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
import { ProductCategoryType, SailsModelDefnType } from '../../scripts/utils';

let _exports: SailsModelDefnType<ProductCategoryType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: 'string',
      description: 'The name of the product category.',
      required: true,
    },
    imageUrl: {
      type: 'string',
      description: 'The URL of the product category image.',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
      description: 'The category owner.',
      required: true,
    },
    categoryGroup: {
      model: 'categorygroup',
      description: 'The category group shared between vendors.',
      required: true,
    },
    products: {
      collection: 'product',
      via: 'category',
    },
  },

  afterCreate: async function (newlyCreatedRecord, proceed) {
    if (newlyCreatedRecord.vendor) {
      await Vendor.addToCollection(
        newlyCreatedRecord.vendor,
        'productCategories',
        [newlyCreatedRecord.id]
      );
    }

    return proceed();
  },
};

module.exports = _exports;

