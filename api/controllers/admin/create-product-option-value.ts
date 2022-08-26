declare var ProductOptionValue: any;
declare var ProductOption: any;
declare var sails: any;

module.exports = {

  friendlyName: 'Create product option value',

  description: '',

  inputs: {
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
    },
    priceModifier: {
      type: 'number'
    },
    isAvailable: {
      type: 'boolean',
    },
    productOption: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      outputDescription: 'The newly created `ProductOptionValue`s ID.',
      outputExample: {}
    },
    unauthorised: {
      description: 'You are not authorised to create product option values for this product option.',
      responseType: 'unauthorised'
    },
  },

  fn: async function (inputs) {
    let productOption = await ProductOption.findOne({ id: inputs.productOption })
    .populate('product');

    if (!productOption) {
      throw new Error('Product option not found.');
    }

    // Check that user is authorised to modify products for this vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: productOption.product.vendor
    });

    if(!isAuthorisedForVendor) {
      throw 'unauthorised';
    }

    var newProductOptionValue = await ProductOptionValue.create({
      name: inputs.name,
      description: inputs.description,
      priceModifier: inputs.priceModifier,
      isAvailable: inputs.isAvailable,
      option: inputs.productOption
    }).fetch();

    // All done.
    return {
      id: newProductOptionValue.id
    };

  }

};
