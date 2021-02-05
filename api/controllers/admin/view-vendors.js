module.exports = {


  friendlyName: 'View vendors',


  description: 'Display "Vendors" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/vendors'
    }

  },


  fn: async function () {
    var vendors = await Vendor.find();

    // Respond with view.
    return {vendors};

  }


};
