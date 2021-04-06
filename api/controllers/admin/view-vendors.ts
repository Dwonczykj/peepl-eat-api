declare var Vendor: any;
module.exports = {

  friendlyName: 'View vendors',

  description: 'Display "Vendors" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/vendors'
    }

  },

  fn: async function (inputs, exits) {
    var vendors = await Vendor.find();

    // Respond with view.
    return exits.success({vendors});

  }

};
