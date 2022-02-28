module.exports = {

  friendlyName: 'View homepage',

  description: 'Display homepage.',

  exits: {

    success: {
      viewTemplatePath: 'pages/homepage'
    }

  },

  fn: async function () {
    await sails.helpers.getAvailableSlots('28/02/2022', 1);

    // Respond with view.
    return {};

  }

};
