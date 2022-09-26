module.exports = {

  friendlyName: 'Edit product option value',

  description: '',

  inputs: {
    id: {
      type: 'number',
      required: true
    },
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
    }
  },

  exits: {
    success: {
      outputDescription: 'The newly updated `ProductOptionValue` ID.',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
    let productOptionValue = await ProductOptionValue.findOne({ id: inputs.id }).populate('option.product');

    // Check if user has permission to edit the product option value.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: productOptionValue.option.product.vendor
    });

    if(!isAuthorisedForVendor) {
      return exits.error(new Error('You are not authorised to edit this product option value.'));
    }

    var newProductOptionValue = await ProductOptionValue.updateOne(inputs.id).set(inputs);

    // All done.
    return exits.success({
      id: newProductOptionValue.id
    });
  }

};
