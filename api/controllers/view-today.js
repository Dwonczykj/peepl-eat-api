module.exports = {


  friendlyName: 'View today',


  description: 'Display "Today" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/today'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
