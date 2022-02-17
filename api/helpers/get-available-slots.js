var moment = require('moment');
module.exports = {


  friendlyName: 'Get available slots',


  description: 'Get the available time slots for a given date and fulfilmentMethod.',


  inputs: {
    date: {
      type: 'string',
      description: 'The date for which time slots need to be generated.'
    },
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

    var availableSlots;

    var date = '17/02/2022';

    // We would fetch applicable opening hours and fulfilment method details from DB

    var openingHours = [
      {
        dayOfWeek: 0, // Sunday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        dayOfWeek: 1, // Monday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        dayOfWeek: 2, // Tuesday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        dayOfWeek: 3, // Wednesday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        dayOfWeek: 4, // Thursday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        dayOfWeek: 5, // Friday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      },
      {
        dayOfWeek: 6, // Saturday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      }
    ];

    var fulfilmentMethod = {
      fulfilmentType: 'delivery',
      slotLength: 60,
      bufferLength: 15,
      vendorId: 1,
      ordersPerSlot: 1 // Vendor only takes one order per hour!
    };

    var dt = new Date(date); // Javascript Date version of date
    var dayOfWeek = dt.getDay(); // 4 (Thursday)

    var dayOpeningHours = openingHours[dayOfWeek]; // Wouldn't need this in practice as would only query DB for this day & date

    var startTime = moment(dayOpeningHours.openTime, 'HH:mm'); // Start time for creating slots.
    var endTime = moment(dayOpeningHours.closeTime, 'HH:mm'); // End time for creating slots.

    var slots = [];

    // Generate slots based on slotLength within opening hours.
    while (startTime <= endTime) {
      var slot = {};

      slot.startTime = new moment(startTime).format('HH:mm');
      startTime.add(fulfilmentMethod.slotLength, 'minutes');
      slot.endTime = new moment(startTime).format('HH:mm');

      slots.push(slot);
    }

    // Fetch orders for day
    var orders = [{
      fulfilmentSlotFrom: '17/02/2022 10:00',
      fulfilmentSlotTo: '17/02/2022 11:00',
      // ...
    }, {
      fulfilmentSlotFrom: '17/02/2022 13:00',
      fulfilmentSlotTo: '17/02/2022 14:00',
      // ...
    }];

    // Loop through possible slots and determine if number of orders is greater than ordersPerSlot
    slots.forEach(slot => {
      // Filter out orders between start and end of slot.
      var relevantOrders = orders.filter(order => {
        if(order.fulfilmentSlotFrom >= slot.startTime && order.fulfilmentSlotTo <= slot.endTime) {
          return true;
        } else {
          return false;
        }
      });

      if (relevantOrders.length < fulfilmentMethod.ordersPerSlot) { // If there aren't too many orders in the slot
        availableSlots.push(slot); // Add slot to availableSlots array
      }
    });

    // What we want to return:
    /* var availableSlots = [{
      slotId: 0,
      startTime: '17/02/2022 09:00',
      endTime: '17/02/2022 10:00',
    }, {
      slotId: 1,
      startTime: '17/02/2022 10:00',
      endTime: '17/02/2022 11:00',
    }, {
      slotId: 2,
      startTime: '17/02/2022 11:00',
      endTime: '17/02/2022 12:00',
    }, {
      slotId: 3,
      startTime: '17/02/2022 12:00',
      endTime: '17/02/2022 13:00',
    }, {
      slotId: 4,
      startTime: '17/02/2022 13:00',
      endTime: '17/02/2022 14:00',
    }, {
      slotId: 5,
      startTime: '17/02/2022 14:00',
      endTime: '17/02/2022 15:00',
    }, {
      slotId: 6,
      startTime: '17/02/2022 15:00',
      endTime: '17/02/2022 16:00',
    }, {
      slotId: 7,
      startTime: '17/02/2022 16:00',
      endTime: '17/02/2022 17:00',
    }] */

    // Send back the result through the success exit.
    return availableSlots;
  }
};

