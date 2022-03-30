

module.exports = {
  friendlyName: 'Create or Update Opening Hours',

  inputs: {
    openingHours: {
      type: 'json',
      columnType: 'array'
    }
  },

  exits: {
    success: {
      outputDescription: 'The updated opening hours',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
    inputs.openingHours.forEach(
        async hours => {
          await OpeningHours.updateOne(hours.id).set(hours);
        }
    );
  }
};
