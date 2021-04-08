module.exports = {


  friendlyName: 'View edit product',


  description: 'Display "Edit product" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/edit-product'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
