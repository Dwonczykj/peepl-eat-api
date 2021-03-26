module.exports = {


  friendlyName: 'View all orders',


  description: 'Display "All orders" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/orders/all-orders'
    }

  },


  fn: async function () {
    var isVendor = await Vendor.findOne(this.req.session.walletId);
    var orders;

    if(isVendor){
      orders = await Order.find({paidDateTime: {'>': 0}})
      .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue');
    } else {
      orders = await Order.find({paidDateTime: {'>': 0}})
      .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue');
    }

    // Respond with view.
    return {orders, isVendor};

  }


};
