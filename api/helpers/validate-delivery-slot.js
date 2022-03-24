module.exports = {


  friendlyName: 'Validate delivery slot',


  description: 'Validates a given delivery slot for a delivery method.',


  inputs: {
    fulfilmentMethodId: {
      type: 'number',
      required: true
    },
    fulfilmentSlotFrom: {
      type: 'string',
      required: true
    },
    fulfilmentSlotTo: {
      type: 'string',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    var moment = require('moment');

    var date = moment(inputs.fulfilmentSlotFrom, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');

    var validSlots = await sails.helpers.getAvailableSlots.with({date, fulfilmentMethodId: inputs.fulfilmentMethodId});

    // Find slot within list of valid slots
    const found = validSlots.find(slots => {
      return (moment(inputs.fulfilmentSlotFrom).isSame(slots.startTime)) && (moment(inputs.fulfilmentSlotTo).isSame(slots.endTime));
    });

    if (found) {
      return true;
    } else {
      return false;
    }
  }


};

