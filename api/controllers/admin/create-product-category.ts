import { CategoryGroupType, ProductCategoryType } from '../../../scripts/utils';
import { SailsModelType } from '../../../api/interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
import util from 'util';
module.exports = {
  friendlyName: 'Create product category',

  description: '',

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
      alreadyExists: () => void;
    }
  ) {
    var exist = await ProductCategory.find({
      name: inputs.name,
    });
    if (exist && exist.length > 0) {
      sails.log(
        `CategoryGroup: ${util.inspect(exist[0], {
          depth: null,
        })} already exists.`
      );
      return exits.alreadyExists();
    }

    const inputsWithImage = {
      ...inputs,
      ...{
        imageUrl: '',
      },
    };

    if (inputsWithImage.image) {
      let imageInfo = await sails.helpers.uploadOneS3(inputsWithImage.image);
      if (imageInfo) {
        inputsWithImage.imageUrl =
          sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
      delete inputsWithImage.image; 
    }

    const categoryGroup = await CategoryGroup.findOne(inputsWithImage.categoryGroup);
    if (!categoryGroup) {
      delete inputsWithImage.categoryGroup;
    }
    const vendor = await Vendor.findOne(inputsWithImage.vendor);
    if(!vendor){
      delete inputsWithImage.vendor;
    }

    // Create a new product category
    var newProductCategory = await ProductCategory.create({
      ...inputsWithImage,
      ...{products: [],}
    }).fetch();

    // Return the new product category
    // return exits.success(newCategoryGroup);
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ newProductCategory: newProductCategory });
    } else {
      return exits.success({ newProductCategory: newProductCategory });
    }
  },
};
