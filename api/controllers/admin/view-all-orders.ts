declare var Order: any;
declare var User: any;
module.exports = {

  friendlyName: 'View all orders',

  description: 'Display "All orders" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/all-orders'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {
    let user = await User.findOne(this.req.session.userId);

    let orders = await Order.find({paidDateTime: {'>': 0}, isArchived: false, vendor: user.vendor})
    .populate('items.product&optionValues&optionValues.option&optionValue');

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
