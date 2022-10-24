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
      statusCode: 400,
      responseType: 'notFound'
    },
    success: {
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {
    var order = await Order.findOne(inputs.orderId);

    if(!order){
      return exits.notFound();
    }

    return exits.success({paymentStatus: order.paymentStatus, restaurantAcceptanceStatus: order.restaurantAcceptanceStatus});

  }


};
