module.exports = {


  friendlyName: 'Validate delivery slot',


  description: 'Validates a given delivery slot for a delivery method.',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    // Call the getAvailableSlots helper
    // Use Array.find() to check slot sent by caller.
    // If slot valid, send isValid
  }


};

