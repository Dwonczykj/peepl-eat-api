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
    var newProductOption = await ProductOption.updateOne(inputs.id).set(inputs);

    // All done.
    return exits.success({
      id: newProductOption.id
    });
  }

};
