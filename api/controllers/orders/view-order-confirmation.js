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

    var order = await Order.findOne(inputs.orderId)
    .populate('items.product&items.deliveryMethod&items.deliverySlot&items.optionValues.option&items.optionValues.optionValue')


    console.log(order);
    
    // Respond with view.
    return exits.success({
      order
    });

  }


};
