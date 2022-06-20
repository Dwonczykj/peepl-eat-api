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


  fn: async function (inputs) {
    var order = await Order.findOne(inputs.orderId)
    .populate('vendor');

    if(!order) {
      throw 'notFound';
    }

    // All done.
    return {order};

  }


};
