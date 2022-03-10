module.exports = {


  friendlyName: 'View approve order',


  description: 'Display "Approve order" page.',

  inputs:{
    orderId: {
      type: 'number',
      description: 'The order to be approved or declined.',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/approve-order'
    }

  },


  fn: async function (inputs) {
    var order = await Order.findOne(inputs.orderId);

    // Respond with view.
    return {order};

  }


};
