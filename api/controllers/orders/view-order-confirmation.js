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
    .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue&vendor');

    await sails.helpers.sendTemplateEmail.with({
      template: 'email-order-confirmation',
      templateData: {order},
      to: order.deliveryEmail,
      subject: 'Peepl Eat Order Confirmed - #' + order.id ,
      layout: false,
    });

    if(!order || !order.paidDateTime){
      return exits.error();
    }

    // Respond with view.
    return exits.success({
      order
    });

  }


};
