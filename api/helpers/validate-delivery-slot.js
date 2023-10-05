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
    noValidSlots: {
      description: 'No available slots found'
    }

  },


  fn: async function (inputs, exits) {
    var moment = require('moment');

    // Strip time from inputted datetime
    var date = moment.utc(inputs.fulfilmentSlotFrom, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');

    var validSlots = [];
    try {
	    validSlots = await sails.helpers.getAvailableSlots.with({date, fulfilmentMethodId: inputs.fulfilmentMethodId});
    } catch (error) {
      sails.log.error(`helpers.getAvailableSlots blew up: ${error}`);
    }

    if(!validSlots){
      sails.log.info(
        `helpers.validateDeliverySlots found no valid slots from helpers.getAvailableSlots`
      );
      return exits.noValidSlots();
    }

    sails.log.verbose(`helpers.validateDeliverySlots found ${validSlots.length} valid slots date: "${date}".`);

    // Find slot within list of valid slots
    const found = validSlots.find(slots => {
      return (
        moment.utc(inputs.fulfilmentSlotFrom).isSame(slots.startTime) &&
        moment.utc(inputs.fulfilmentSlotTo).isSame(slots.endTime)
      );
    });




    if (found) {
      return exits.success(true);
    } else {
      return exits.success(false);
    }
  }


};

