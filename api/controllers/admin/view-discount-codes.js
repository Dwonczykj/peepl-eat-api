module.exports = {


  friendlyName: 'View discount codes',


  description: 'Display "Discount codes" page.',

  inputs: {
    vendorId: {
      type: 'number',
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/discount-codes'
    },
    successJSON: {
      statusCode: 200,
    }

  },


  fn: async function (inputs, exits) {
    var discounts = [];
    let user = await User.findOne({id: this.req.session.userId});

    if(user.isSuperAdmin && inputs.vendorId) {
      discounts = await Discount.find({vendor: inputs.vendorId}).sort('expiryDateTime ASC');
    } else if (user.isSuperAdmin) {
      discounts = await Discount.find().sort('expiryDateTime ASC');
    } else {
      discounts = await Discount.find({ vendor: user.vendor }).sort(
        'expiryDateTime ASC'
      );
    }

    const vendors = await Vendor.find({
      status: 'active',
    });


    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON({ discounts: discounts, vendors: vendors });
    } else {
      return exits.success({ discounts, vendors: vendors });
    }
  }


};
