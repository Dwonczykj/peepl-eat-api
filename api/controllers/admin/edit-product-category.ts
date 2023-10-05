import { ProductCategoryType } from '../../../scripts/utils';
import { SailsModelType, sailsVegi, ShallowSailsModels } from '../../interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;

declare var sails: sailsVegi;
// import util from 'util';
module.exports = {
  friendlyName: 'Edit product category',

  description: '',

  files: ['image'],

  inputs: {
    id: {
      type: 'number',
      required: true,
      description: 'The id of the product category',
    },
    name: {
      type: 'string',
      required: true,
      description: 'The name of the product category',
      maxLength: 50,
    },
    categoryGroup: {
      type: 'number',
      required: true,
    },
    vendor: {
      type: 'number',
      required: true,
    },
    image: {
      type: 'ref',
      required: false,
    },
  },

  exits: {
    success: {
      description: 'New product category created.',
      statusCode: 200,
    },
    successJSON: {
      statusCode: 200,
    },
    notFound: {
      statusCode: 404,
      responseType: 'notFound',
    },
  },

  fn: async function (
    inputs: {
      id: number;
      name: string;
      categoryGroup: number;
      vendor: number;
      image?: any;
    },
    exits: {
      success: (unusedArg?: {
        updatedProductCategory: ShallowSailsModels<ProductCategoryType>;
      }) => void;
      successJSON: (unusedArg?: {
        updatedProductCategory: ShallowSailsModels<ProductCategoryType>;
      }) => void;
      notFound: () => void;
    }
  ) {
    const productCategories = await sails.helpers.editProductCategories.with({
      productCategories: [inputs],
    });
    if (!productCategories || productCategories.length < 1) {
      sails.log.info(`No product categories updated`);
      return exits.notFound();
    }
    const updatedProductCategory = await ProductCategory.findOne(inputs.id);

    // Return the new product category
    // return exits.success(newCategoryGroup);
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({
        updatedProductCategory: updatedProductCategory,
      });
    } else {
      return exits.success({ updatedProductCategory: updatedProductCategory });
    }
  },
};
