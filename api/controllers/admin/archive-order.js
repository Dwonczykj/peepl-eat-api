module.exports = {


  friendlyName: 'Archive order',


  description: '',


  inputs: {
    orderId: {
      type: 'number',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {

    await Order.updateOne(inputs.orderId).set({isArchived: true});

    // All done.
    return;

  }


};
