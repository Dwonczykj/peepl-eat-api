declare var ProductOption: any;

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
      outputDescription: 'The newly created `Vendor`s ID.',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
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