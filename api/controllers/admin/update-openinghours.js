

module.exports = {
  friendlyName: 'Update Opening Hours',

  inputs: {
    openingHours: {
      type: 'json',
      description: 'The opening hours to be added to the vendor',
      required: true
    }
  },

  exits: {
    success: {
      outputDescription: 'The updated opening hours',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
    // TODO: Proper error handling
    inputs.openingHours.forEach(
        async hours => {
          await OpeningHours.updateOne(hours.id).set(hours);
        }
    );
    return exits.success(inputs.openingHours);
  }

};
