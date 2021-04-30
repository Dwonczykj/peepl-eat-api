module.exports = {


  friendlyName: 'View create vendor',


  description: 'Display "Create vendor" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/edit-vendor'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
