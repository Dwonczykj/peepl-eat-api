module.exports = {


  friendlyName: 'View postal districts',


  description: 'Display "Postal districts" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/postal-districts'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
