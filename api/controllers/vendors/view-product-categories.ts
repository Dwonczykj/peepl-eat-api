import {
  VendorType,
} from '../../../scripts/utils';
import { SailsModelType } from '../../interfaces/iSails';
declare var Vendor: SailsModelType<VendorType>;

export type GetProductCategoriesInput = {
  vendor: number;
};

export type GetProductCategoriesSuccess = {
  productCategories: Array<{
    name: string;
  }>;
}

module.exports = {
  friendlyName: 'view vendor product categories',

  inputs: {
    vendor: {
      type: 'number',
      required: true,
    },
  },

  exits: {
    success: {
      statusCode: 200,
    },
    notFound: {
      statusCode: 404,
      responseType: 'notFound',
      description: 'vendor not found'
    }
  },

  fn: async function (
    inputs: GetProductCategoriesInput,
    exits: {
      success: (
        unused: GetProductCategoriesSuccess
      ) => GetProductCategoriesSuccess;
      notFound: () => void;
    }
  ) {
    var vendor = await Vendor.findOne(inputs.vendor).populate(
      'productCategories'
    );

    if(!vendor){
      return exits.notFound();
    }

    const productCategories = vendor.productCategories.map(pc => {
      return {
        name: pc.name,
      };
    });

    return exits.success({productCategories});
  },
};
