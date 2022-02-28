module.exports = {

  friendlyName: 'View homepage',

  description: 'Display homepage.',

  exits: {

    success: {
      viewTemplatePath: 'pages/homepage'
    }

  },

  fn: async function () {
    var slots = await sails.helpers.getAvailableSlots('28/02/2022', 1);

    console.log(slots);

    // Respond with view.
    return {};

  }

};
