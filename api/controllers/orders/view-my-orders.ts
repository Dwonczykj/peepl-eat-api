declare var Order: any;
module.exports = {

  friendlyName: 'View my orders',

  description: 'Display "My orders" page.',

  inputs: {
    walletId: {
      type: 'string',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/my-orders'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {
    var orders = await Order.find({customerWalletAddress: inputs.walletId, paidDateTime: {'>': 0}})
    .populate('vendor&items.product&optionValues&optionValues.option&optionValue');

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {orders}
      );
    } else {
      return exits.success({orders});
    }


  }

};
