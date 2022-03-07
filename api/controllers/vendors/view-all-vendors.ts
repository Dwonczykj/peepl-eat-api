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

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {vendors}
      );
    } else {
      return exits.success({vendors, hasOrders: false});
    }
  }
};
