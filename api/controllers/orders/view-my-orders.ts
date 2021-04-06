declare var Order: any;
module.exports = {

  friendlyName: 'View my orders',

  description: 'Display "My orders" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/my-orders'
    }

  },

  fn: async function () {
    var orders = await Order.find({customer: this.req.session.walletId, paidDateTime: {'>': 0}})
    .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue');

    // Respond with view.
    return {orders};

  }

};
