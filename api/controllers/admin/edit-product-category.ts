import { CategoryGroupType, ProductCategoryType } from '../../../scripts/utils';
import { SailsModelType } from '../../interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
// import util from 'util';
module.exports = {
  friendlyName: 'Edit product category',

  description: '',

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
        updatedProductCategory: ProductCategoryType;
      }) => void;
      successJSON: (unusedArg?: {
        updatedProductCategory: ProductCategoryType;
      }) => void;
      notFound: () => void;
    }
  ) {
    var exist = await ProductCategory.find(inputs.id);
    if (!exist || exist.length === 0) {
      return exits.notFound();
    }

    const useInputs = {
      ...inputs,
      ...{
        imageUrl: '',
      },
    };
    let updateArgs;
    if (useInputs.image) {
      let imageInfo = await sails.helpers.uploadOneS3(useInputs.image);
      if (imageInfo) {
        useInputs.imageUrl =
          sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
      delete useInputs.image;
      updateArgs = useInputs;
    } else {
      updateArgs = inputs;
    }

    let categoryGroup = null;
    if (useInputs.categoryGroup) {
      categoryGroup = await CategoryGroup.findOne(useInputs.categoryGroup);
      if(categoryGroup){
        updateArgs.categoryGroup = categoryGroup.id;
      }
    }
    let vendor = null;
    if (useInputs.vendor) {
      vendor = await Vendor.findOne(useInputs.vendor);
      if (vendor) {
        updateArgs.vendor = vendor.id;
      }
    }

    // Update product category
    await ProductCategory.updateOne(inputs.id).set({
      ...updateArgs,
      ...(useInputs.imageUrl ? { imageUrl: useInputs.imageUrl } : {}),
    });
    const updatedProductCategory = await ProductCategory.findOne(useInputs.id);

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
