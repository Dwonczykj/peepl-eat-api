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
    notFound: {
      responseType: 'notFound'
    }
  },


  fn: async function (inputs, exits) {
    var order = await Order.findOne(inputs.orderId);

    if(!order){
      return exits.notFound();
    }

    return {paymentStatus: order.paymentStatus, restaurantAcceptanceStatus: order.restaurantAcceptanceStatus};

  }


};