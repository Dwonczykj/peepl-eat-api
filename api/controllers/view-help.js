module.exports = {


  friendlyName: 'View help',


  description: 'Display "Help" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/help'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
