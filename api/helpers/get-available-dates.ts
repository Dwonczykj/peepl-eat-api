declare var OpeningHours: any;
declare var FulfilmentMethod: any;

// var moment = require('moment');
module.exports = {


  friendlyName: 'Get available dates',


  description: 'Get the available dates for a given fulfilmentMethod.',


  inputs: {
    fulfilmentMethodId: {
      type: 'number',
      description: 'The ID of the fulfilmentMethod which is being requested.'
    }
  },


  exits: {
    success: {
      outputFriendlyName: 'Available slots',
    },
  },


  fn: async function (inputs) {
    // TODO: Consider timezones
    // TODO: Account for overnight opening hours
    // TODO: Generate IDs for slots to simplify logic (but must account for changes to opening hours and slot duration)
    // TODO: Limit to 7 days in future

    var availableDaysOfWeek:Array<string> = [];
    var availableSpecialDates:Array<Date> = [];

    const monthDiff = (d1, d2) => {
      let months;
      months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      return months <= 0 ? 0 : months;
    };


    var fulfilmentMethod = await FulfilmentMethod.findOne(inputs.fulfilmentMethodId);

    if (!fulfilmentMethod){
      return {
        availableDaysOfWeek,
        availableSpecialDates
      };
    }
    /* var fulfilmentMethod = {
      fulfilmentType: 'delivery',
      slotLength: 60,
      bufferLength: 15,
      vendorId: 1,
      ordersPerSlot: 1
    }; */

    // Get special opening hours from DB (for specific date)
    var openingHoursList:Array<any> = await OpeningHours.find({
      fulfilmentMethod: inputs.fulfilmentMethodId,
      isOpen: true,
    });

    /* var openingHours = {
        dayOfWeek: 'monday', // Monday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      }; */

    // If there are opening hours available
    openingHoursList.forEach(openingHours => {
      if(openingHours && openingHours.isOpen) {

        var dayOfWeek = openingHours.dayOfWeek;

        if(!openingHours.specialDate){
          availableDaysOfWeek.push(dayOfWeek);
        } else {
          const specialDate = new Date(Date.parse(openingHours.specialDate.toString()));
          if(monthDiff(Date.now(), specialDate) < 4){
            availableSpecialDates.push(specialDate);
          }
        }
      }
    });

    // Send back the result through the success exit.
    return {
      availableDaysOfWeek,
      availableSpecialDates
    };
  }
};

