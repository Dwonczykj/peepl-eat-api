import { ProductOptionType, ProductOptionValueType } from '../../../scripts/utils';
import { SailsModelType, sailsVegi } from '../../interfaces/iSails';

declare var sails: sailsVegi;
declare var ProductOptionValue: SailsModelType<ProductOptionValueType>;
declare var ProductOption: SailsModelType<ProductOptionType>;

type UpdateStockCountResponseType = {
  success: false;
  message: string
} | {success: true};


module.exports = {
  friendlyName: 'Update stock count',

  description: 'Post an update to update the remaining stock count for an item',

  inputs: {
    productOptionValueId: {
      type: 'number',
      required: true,
    },
    remainingStockCount: {
      type: 'number',
      required: true,
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
    },
    unauthorised: {
      statusCode: 401,
    },
    badFormat: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: {
      productOptionValueId: number;
      remainingStockCount: number;
    },
    exits: {
      success: (
        unusedArg: UpdateStockCountResponseType
      ) => UpdateStockCountResponseType;
      successJSON: (
        unusedArg: UpdateStockCountResponseType
      ) => UpdateStockCountResponseType;
      notFound: (unusedMessage?: string) => void;
      badFormat: (unusedMessage?: string) => void;
      unauthorised: (unusedMessage?: string) => void;
    }
  ) {
    const productOptionValue = await ProductOptionValue.findOne(
      inputs.productOptionValueId
    );
    if (!productOptionValue) {
      return exits.notFound('Product Option Value Not Found');
    }

    const productOption = await ProductOption.findOne({
      id: productOptionValue.option,
    }).populate('product');

    // Check that user is authorised to modify products for this vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: productOption.product.vendor,
    });

    if (!isAuthorisedForVendor) {
      return exits.unauthorised('Not authorised to administrate vendor');
    }

    if (!Number.isInteger(inputs.remainingStockCount)) {
      return exits.badFormat();
    }

    await ProductOptionValue.update({
      id: productOptionValue.id,
    }).set({
      stockCount: inputs.remainingStockCount,
    });

    // Return the new product category
    // return exits.success(newCategoryGroup);
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({
        success: true,
      });
    } else {
      return exits.success({
        success: true,
      });
    }
  },
};
