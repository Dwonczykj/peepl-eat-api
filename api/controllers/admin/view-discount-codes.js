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
      discounts = await Discount.find({vendor: inputs.vendorId});
    } else if (user.isSuperAdmin) {
      discounts = await Discount.find();
    } else {
      discounts = await Discount.find({vendor: user.vendor});
    }


    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {discounts}
      );
    } else {
      return exits.success({discounts});
    }
  }


};
