module.exports = {


  friendlyName: 'View vendor menu',


  description: 'Display "Vendor menu" page.',

  inputs: {
    vendorid: {
      type: 'number',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/vendors/vendor-menu'
    }

  },


  fn: async function (inputs) {
    var vendor = await Vendor.findOne(inputs.vendorid)
    .populate('products');

    // Respond with view.
    return {vendor, wallet: this.req.session.walletId};

  }


};
 