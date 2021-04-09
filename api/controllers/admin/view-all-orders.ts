declare var Order: any;
module.exports = {

  friendlyName: 'View all orders',

  description: 'Display "All orders" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/all-orders'
    }

  },

  fn: async function (inputs, exits) {
    // var isVendor = await Vendor.findOne({walletId: this.req.session.walletId});
    var isVendor = true;
    var orders;

    if(isVendor){
      orders = await Order.find({paidDateTime: {'>': 0}, isArchived: false})
      .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue');
    } else {
      orders = await Order.find({paidDateTime: {'>': 0}, isArchived: false})
      .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue');
    }

    // Respond with view.
    return exits.success({orders, isVendor});

  }

};
