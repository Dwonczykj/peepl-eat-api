module.exports = {

  friendlyName: 'Edit product option',

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
  },

  exits: {
    success: {
      outputDescription: 'The newly updated `ProductOption` ID.',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
    let productOption = await ProductOption.findOne({ id: inputs.id }).populate('product');

    // Check if user is authorised to edit product option.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: productOption.product.vendor
    });

    if(!isAuthorisedForVendor) {
      return exits.error(new Error('You are not authorised to edit this product option.'));
    }

    var newProductOption = await ProductOption.updateOne(inputs.id).set(inputs);

    // All done.
    return exits.success({
      id: newProductOption.id
    });
  }

};
