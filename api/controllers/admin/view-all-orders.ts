declare var Order: any;
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
    // var isVendor = await Vendor.findOne({walletAddress: this.req.session.walletId});
    var isVendor = true;
    var orders;

    if(isVendor){
      orders = await Order.find({paidDateTime: {'>': 0}, isArchived: false})
      .populate('items.product&optionValues&optionValues.option&optionValue');
    } else {
      orders = await Order.find({paidDateTime: {'>': 0}, isArchived: false})
      .populate('items.product&optionValues&optionValues.option&optionValue');
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {orders, isVendor}
      );
    } else {
      return exits.success({orders, isVendor});
    }

  }

};
