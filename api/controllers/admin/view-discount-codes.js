module.exports = {


  friendlyName: 'View discount codes',


  description: 'Display "Discount codes" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/discount-codes'
    }

  },


  fn: async function () {
    var discounts = await Discount.find();

    // Respond with view.
    return {discounts};

  }


};
