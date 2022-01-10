declare var Vendor: any;
declare var User: any;
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
    },
    successJSON: {
      statusCode: 200,
    }

  },


  fn: async function (inputs, exits) {
    var vendor = await Vendor.findOne(inputs.vendorid)
    .populate('products', {
      where: {
        isAvailable: true
      },
      sort: 'priority DESC'
    });

    var user = await User.findOne({walletId: this.req.session.walletId});

    if(!vendor){
      return exits.error();
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {vendor, user, wallet: this.req.session.walletId}
      );
    } else {
      return exits.success({vendor, user, wallet: this.req.session.walletId});
    }

  }


};
