declare var ProductOption: any;

module.exports = {

  friendlyName: 'Get product options',

  description: 'Get the options for the product as well as the relevant options.',

  inputs: {
    productId: {
      type: 'number',
      description: 'The ID of the product that we want the options for.',
      required: true
    }
  },

  exits: {

  },

  fn: async function (inputs, exits) {
    var options = await ProductOption.find({product: inputs.productId})
    .populate('values', {
      where: {
        isAvailable: true
      }
    });

    // All done.
    return exits.success(options);

  }

};
