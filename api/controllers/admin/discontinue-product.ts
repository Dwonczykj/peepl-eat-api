declare var sails: any;
declare var Product: any;

module.exports = {

  friendlyName: 'Discontinue product',

  description: 'Voids a product item so that it still exists for future data analytics but is no longer available to be sold by a vendor.',

  files: ['image'],

  inputs: {
    id: {
      type: 'number',
      required: true
    },
    vendor: {
      type: 'number'
    },
  },

  exits: {
    success: {
      outputDescription: 'The voided `Product`s ID.',
      outputExample: {
        id: 'old_product_id'
      }
    },
  },

  fn: async function (inputs, exits) {
    // Check that user is authorised to modify products for this vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      productId: inputs.id,
      vendorId: inputs.vendor
    });

    if (!isAuthorisedForVendor) {
      return exits.error(new Error('You are not authorised to modify products for this vendor.'));
    }

    const mods = { ...inputs, ...{ 'status': 'inactive' } };

    var discontinuedProduct = await Product.updateOne(inputs.id).set(mods);

    // All done.
    return exits.success({
      id: discontinuedProduct.id
    });

  }

};
