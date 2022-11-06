import { sailsModelKVP, SailsModelType, sailsVegi } from "../interfaces/iSails";
import { ProductCategoryType, CategoryGroupType } from "../../scripts/utils";

declare var sails: sailsVegi;
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
import util from 'util';

export type EditProductCategoriesInput = {
  productCategories: Array<
    | {
        id: number;
        name: string;
        categoryGroup: number;
        vendor: number;
        image?: any;
      }
    | {
        id: number;
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
    },
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
    inputs: EditProductCategoriesInput,
    exits: {
      success: (
        unusedResult: Array<sailsModelKVP<ProductCategoryType>>
      ) => void;
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
        id: productCatInput.id,
      });
      if (!exist) {
        sails.log(`Could not find ProductCategory to update with id: ${productCatInput.id}`);
        continue;
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
      };

      await ProductCategory.updateOne(newProductCategory.id).set(
        newProductCategory
      );
      newCats.push(newProductCategory);
    }
    if (newCats.length === 0) {
      return exits.success([]);
    }
    const updates = await ProductCategory.find({
      id: newCats.map((_n) => _n.id),
    });

    return exits.success(updates);
  },
};
