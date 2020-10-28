module.exports = {


  friendlyName: 'View all vendors',


  description: 'Display "All vendors" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/vendors/all-vendors'
    }

  },


  fn: async function () {
    var vendors = await Vendor.find();
    // Respond with view.
    return {vendors};

  }


};
