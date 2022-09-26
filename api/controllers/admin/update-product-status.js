module.exports = {


  friendlyName: 'Update product statuses',


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
    // TODO: Test this
    let user = await User.findOne({id: this.req.session.userId});

    await Product.update({id: inputs.productIds, vendor: user.vendor})
    .set({isAvailable: inputs.isAvailable});

    // All done.
    return exits.success();

  }


};
