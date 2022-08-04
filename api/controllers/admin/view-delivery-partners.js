module.exports = {


  friendlyName: 'View delivery partners',


  description: 'Display "Delivery partners" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/delivery-partners'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
