module.exports = {


  friendlyName: 'View approve order',


  description: 'Display "Approve order" page.',

  inputs:{
    orderId: {
      type: 'string',
      description: 'The order to be approved or rejected.',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/approve-order'
    }

  },


  fn: async function (inputs) {
    var order = await Order.findOne({publicId: inputs.orderId})
    .populate('fulfilmentMethod&items.product&optionValues&optionValues.option&optionValue');

    // Respond with view.
    return {order};

  }


};
