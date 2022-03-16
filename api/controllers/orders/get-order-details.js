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
    var order = await Order.findOne(inputs.orderId);

    if(order){
      // All done.
      return exits.success({order});
    } else {
      return exits.notFound();
    }

  }


};
