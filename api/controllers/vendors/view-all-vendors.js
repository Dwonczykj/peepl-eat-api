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
    var orders = await Order.findOne({customer: this.req.session.walletId});
    var hasOrders = false;

    if(orders.length >= 1){
      hasOrders = true;
    }

    // Respond with view.
    return {vendors, hasOrders};

  }


};
