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
    
    var user = await User.findOne({walletId: this.req.session.walletId});

    if(!vendor){
      return exits.error();
    }

    // Respond with view.
    return exits.success({vendor, user, wallet: this.req.session.walletId});

  }


};
 