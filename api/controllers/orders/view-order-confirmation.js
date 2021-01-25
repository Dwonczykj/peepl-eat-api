module.exports = {


  friendlyName: 'View order confirmation',


  description: 'Display "Order confirmation" page.',

  inputs: {
    orderId:{
      type: 'number',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/order-confirmation'
    }

  },


  fn: async function (inputs, exits) {

    // Handle missing orders
    var order = await Order.findOne(inputs.orderId)
    .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue')

    if(!order || !order.paidDateTime){
      return exits.error();
    }

    await sails.helpers.calculateOrderTotal.with({orderId: inputs.orderId});

    // Respond with view.
    return exits.success({
      order
    });

  }


};
