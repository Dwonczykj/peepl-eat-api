import { SailsModelType, sailsVegi } from "../interfaces/iSails";
import { ProductCategoryType, CategoryGroupType } from "../../scripts/utils";

declare var sails: sailsVegi;
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
import util from 'util';

export type CreateProductCategoriesInput = {
  productCategories: Array<
    | {
        name: string;
        categoryGroup: number;
        vendor: number;
        image?: any;
      }
    | {
        name: string;
        categoryGroup: number;
        vendor: number;
        imageUrl: string;
      }
  >;
};

module.exports = {
  friendlyName: 'Create ProductCategory Objects in DB',

  inputs: {
    productCategories: {
      type: 'ref',
      required: true,
    }
  },

  exits: {
    success: {
      description: 'All done.',
      data: null,
    },
    badInput: {
      description: 'Input arguments of incorrect type',
      data: null,
      error: null,
    },
  },

  fn: async function (
    inputs: CreateProductCategoriesInput,
    exits: {
      success: (unusedResult: Array<ProductCategoryType>) => void;
      badInput: (unusedError?: Error | string) => void;
      alreadyExists: (unusedError?: Error | string) => void;
    }
  ) {
    if (!Array.isArray(inputs.productCategories)) {
      return exits.badInput(
        `Must pass an array to createProductCategories Helper`
      );
    }
    const newCats = [];
    for (const productCatInput of inputs.productCategories) {
      var exist = await ProductCategory.find({
        name: productCatInput.name,
      });
      if (exist && exist.length > 0) {
        sails.log(
          `ProductCategory with name: ${productCatInput.name} already exists.`
        );
        continue;
        // return exits.alreadyExists(
        //   `ProductCategory with name: ${productCatInput.name} already exists.`
        // );
      }

      const inputsWithImage = {
        ...productCatInput,
        ...{
          imageUrl: '',
        },
      };

      if ('image' in inputsWithImage && inputsWithImage.image) {
        let imageInfo = await sails.helpers.uploadOneS3(inputsWithImage.image);
        if (imageInfo) {
          inputsWithImage.imageUrl =
            sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
        }
        delete inputsWithImage.image;
      } else if ('imageUrl' in inputsWithImage && inputsWithImage.imageUrl) {
        //ignore and use imageUrl
      }

      const categoryGroup = await CategoryGroup.findOne(
        inputsWithImage.categoryGroup
      );
      if (!categoryGroup) {
        delete inputsWithImage.categoryGroup;
      }
      const vendor = await Vendor.findOne(inputsWithImage.vendor);
      if (!vendor) {
        delete inputsWithImage.vendor;
      }

      // Create a new product category
      var newProductCategory = {
        ...inputsWithImage,
        ...{ products: [] },
      };

      newCats.push(newProductCategory);
    }
    if (newCats.length === 0) {
      return exits.success([]);
    }
    var newProductCategories = await ProductCategory.createEach(
      newCats
    ).fetch();

    return exits.success(newProductCategories);
  },
};
