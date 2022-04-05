declare var Order: any;
module.exports = {

  friendlyName: 'View order confirmation [DEPRECATED]',

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
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {

    // Handle missing orders
    var order = await Order.findOne(inputs.orderId)
    .populate('items.product&optionValues&optionValues.option&optionValue&vendor');

    if(!order){
      return exits.error();
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {order}
      );
    } else {
      return exits.success({order});
    }

  }


};
