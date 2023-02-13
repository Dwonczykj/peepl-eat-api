import { CategoryGroupType, ProductCategoryType } from '../../../scripts/utils';
import { SailsModelType, sailsVegi } from '../../../api/interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
import util from 'util';
declare var sails: sailsVegi;

module.exports = {
  friendlyName: 'Create product category',

  description: '',

  files: ['image'],

  inputs: {
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
    alreadyExists: {
      description: 'product category already exists',
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: {
      name: string;
      categoryGroup: number;
      vendor: number;
      image: any;
    },
    exits: {
      success: (unusedArg?: {
        newProductCategory: ProductCategoryType;
      }) => void;
      successJSON: (unusedArg?: {
        newProductCategory: ProductCategoryType;
      }) => void;
      alreadyExists: (unusedError?: Error | string) => void;
    }
  ) {
    const newProductCategories =
      await sails.helpers.createProductCategories.with({
        productCategories: [inputs],
      });
    if (!newProductCategories || newProductCategories.length < 1) {
      return exits.alreadyExists(
        `ProductCategory with name: ${inputs.name} already exists.`
      );
    }
    if (this.req.wantsJSON) {
      return exits.successJSON({ newProductCategory: newProductCategories[0] });
    } else {
      return exits.success({ newProductCategory: newProductCategories[0] });
    }
  },
};
