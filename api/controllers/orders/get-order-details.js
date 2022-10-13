module.exports = {


  friendlyName: 'Get order details',


  description: '',


  inputs: {
    orderId: {
      type: 'string',
      required: true
    }
  },


  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },


  fn: async function (inputs, exits) {
    var order = await Order.findOne(inputs.orderId)
    .populate('vendor');

    if(!order) {
      return exits.notFound();
    }

    // All done.
    return exits.success({order});

  }


};
