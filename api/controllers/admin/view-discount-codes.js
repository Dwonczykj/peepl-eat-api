module.exports = {


  friendlyName: 'View discount codes',


  description: 'Display "Discount codes" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/discount-codes'
    },
    successJSON: {
      statusCode: 200,
    }

  },


  fn: async function (inputs, exits) {
    var discounts = await Discount.find();

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
