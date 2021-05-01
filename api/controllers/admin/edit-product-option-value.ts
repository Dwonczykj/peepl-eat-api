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
    var newProductOptionValue = await ProductOptionValue.updateOne(inputs.id).set(inputs);

    // All done.
    return exits.success({
      id: newProductOptionValue.id
    });
  }

};
