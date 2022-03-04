module.exports = {


  friendlyName: 'Get order status',


  description: '',


  inputs: {
    orderId: {
      type: 'number',
      description: 'ID of the order'
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var order = await Order.findOne(inputs.orderId);

    // All done.
    return order;

  }


};
