declare var Vendor: any;
module.exports = {

  friendlyName: 'View vendors',

  description: 'Display "Vendors" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/vendors'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {
    var vendors = await Vendor.find();

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {vendors}
      );
    } else {
      return exits.success({vendors});
    }

  }

};
