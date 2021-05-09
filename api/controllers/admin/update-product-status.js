module.exports = {


  friendlyName: 'Update product status',


  description: '',


  inputs: {
    productIds: {
      type: 'ref',
      required: true
    },
    isAvailable: {
      type: 'boolean',
      required: true
    }
  },


  exits: {
    success:{
    }
  },


  fn: async function (inputs, exits) {

    await Product.update(inputs.productIds)
    .set({isAvailable: inputs.isAvailable});

    // All done.
    return exits.success();

  }


};
