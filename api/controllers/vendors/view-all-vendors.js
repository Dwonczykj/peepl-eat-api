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
    var order = await Order.findOne({customer: this.req.session.walletId, paidDateTime: {'>': 0}});
    var hasOrders = false;

    if(order){
      hasOrders = true;
    }

    // Respond with view.
    return {vendors, hasOrders};

  }


};
