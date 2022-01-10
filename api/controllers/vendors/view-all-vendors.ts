declare var Vendor: any;
declare var Order: any;

module.exports = {

  friendlyName: 'View all vendors',

  description: 'Display "All vendors" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/vendors/all-vendors'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {
    var vendors = await Vendor.find({status: 'active'});
    var orders = await Order.find({customer: this.req.session.walletId, paidDateTime: {'>': 0}});
    var hasOrders = false;

    var isVendor = await Vendor.findOne({walletId: this.req.session.walletId});

    if(isVendor) {
      return this.res.redirect('/admin/orders');
    }

    if(orders.length > 0){
      hasOrders = true;
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {vendors, hasOrders}
      );
    } else {
      return exits.success({vendors, hasOrders});
    }
  }
};
