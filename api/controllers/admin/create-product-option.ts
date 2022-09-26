declare var ProductOption: any;
declare var Product: any;

module.exports = {

  friendlyName: 'Create product option',

  description: '',

  inputs: {
    name: {
      type: 'string',
      required: true
    },
    product: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      outputDescription: 'The newly created `ProductOption`s ID.',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
    let product = await Product.findOne({ id: inputs.product });

    if (!product) {
      return exits.error(new Error('Product not found.'));
    }

    // Check that user is authorised to modify products for this vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: product.vendor
    });

    if(!isAuthorisedForVendor) {
      return exits.error(new Error('You are not authorised to create product options for this product.'));
    }

    var newProductOption = await ProductOption.create({
      name: inputs.name,
      product: inputs.product
    }).fetch()
    .catch((err) => {
      console.log(err);
    });

    // All done.
    return exits.success({
      id: newProductOption.id
    });

  }

};