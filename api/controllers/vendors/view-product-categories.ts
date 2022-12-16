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
    },
    badVendorProductCategories: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: GetProductCategoriesInput,
    exits: {
      success: (
        unused: GetProductCategoriesSuccess
      ) => GetProductCategoriesSuccess;
      notFound: (unusedMessage?:string) => void;
      badVendorProductCategories: (unusedMessage?:string) => void;
    }
  ) {
    var vendor = await Vendor.findOne(inputs.vendor).populate(
      'productCategories'
    );

    if (!vendor) {
      return exits.notFound();
    }
    if (!Array.isArray(vendor.productCategories)) {
      return exits.badVendorProductCategories(`Vendor{${inputs.vendor}} doesnt have productCategories set`);
    }

    const productCategories = vendor.productCategories.map(pc => {
      return {
        id: pc.id,
        name: pc.name,
      };
    });

    return exits.success({productCategories});
  },
};
