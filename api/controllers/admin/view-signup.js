module.exports = {


  friendlyName: 'View signup',


  description: 'Display "Signup" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/signup'
    }

  },


  fn: async function () {

    const vendors = await Vendor.find({ 'status': ['active', 'draft'] });

    // Respond with view.
    return {
      vendors,
      couriers: [],
    };

  }


};
