module.exports = {


  friendlyName: 'View all vendors',


  description: 'Display "All vendors" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/vendors/all-vendors'
    }

  },


  fn: async function () {
    var vendors = await Vendor.find();
    var orders = await Order.find({customer: this.req.session.walletId, paidDateTime: {'>': 0}});
    var hasOrders = false;

    if(orders.length > 0){
      hasOrders = true;
    }

    // Respond with view.
    return {vendors, hasOrders};

  }


};
