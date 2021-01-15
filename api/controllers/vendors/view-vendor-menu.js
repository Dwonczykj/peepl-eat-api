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


  fn: async function (inputs, exits) {
    var vendor = await Vendor.findOne(inputs.vendorid)
    .populate('products');

    if(!vendor){
      return exits.error();
    }

    // Respond with view.
    return exits.success({vendor, wallet: this.req.session.walletId});

  }


};
 