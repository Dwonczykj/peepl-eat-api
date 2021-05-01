declare var ProductOptionValue: any;

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
      outputDescription: 'The newly created `Vendor`s ID.',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
    var newProductOptionValue = await ProductOptionValue.create({
      name: inputs.name,
      description: inputs.description,
      isAvailable: inputs.isAvailable,
      options: [inputs.productOption]
    }).fetch()
    .catch((err) => {
      console.log(err);
    });

    // All done.
    return exits.success({
      id: newProductOptionValue.id
    });

  }

};