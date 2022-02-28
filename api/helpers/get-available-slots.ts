declare var OpeningHours: any;
declare var FulfilmentMethod: any;
module.exports = {


  friendlyName: 'Get available slots',


  description: 'Get the available time slots for a given date and fulfilmentMethod.',


  inputs: {
    date: {
      type: 'string',
      description: 'The date for which time slots need to be generated. Format DD/MM/YYYY',
      defaultsTo: '17/02/2022',
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
    var moment = require('moment');
    // TODO: Consider timezones
    // TODO: Account for overnight opening hours

    var availableSlots = [];

    var fulfilmentMethod = await FulfilmentMethod.findOne(inputs.fulfilmentMethodId);
    /* var fulfilmentMethod = {
      fulfilmentType: 'delivery',
      slotLength: 60,
      bufferLength: 15,
      vendorId: 1,
      ordersPerSlot: 1 // Vendor only takes one order per hour!
    }; */

    var dt = new moment(inputs.date, 'DD/MM/YYYY'); // Moment version of date
    var dayOfWeek = dt.format('dddd').toLowerCase(); // e.g. monday

    // Get special opening hours from DB (for specific date)
    var openingHours = await OpeningHours.findOne({
      fulfilmentMethod: inputs.fulfilmentMethodId,
      specialDate: inputs.date
    });

    // If no special opening hours for this date
    if(!openingHours) {
      // Get regular opening hours for day of week
      openingHours = await OpeningHours.findOne({
        fulfilmentMethod: inputs.fulfilmentMethodId,
        dayOfWeek
      });
    }

    /* var openingHours = {
        dayOfWeek: 'monday', // Sunday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      }; */

    var openTime = inputs.date + ' ' + openingHours.openTime; // e.g. 25/12/2022 09:00
    var closeTime = inputs.date + ' ' + openingHours.closeTime; // e.g. 25/12/2022 17:00

    var startTime = moment(openTime, 'DD/MM/YYYY HH:mm'); // Start time for creating slots.
    var endTime = moment(closeTime, 'DD/MM/YYYY HH:mm'); // End time for creating slots.

    var slots = [];

    // Generate slots based on slotLength within opening hours.
    while (startTime < endTime) {
      var slot = {
        startTime: '',
        endTime: ''
      };

      slot.startTime = startTime;
      startTime.add(fulfilmentMethod.slotLength, 'minutes');
      slot.endTime = startTime;

      slots.push(slot);
    }

    /* var slots = [{
      startTime: '25/12/2022 09:00',
      endTime: '25/12/2022 10:00'
    }, {
      startTime: '25/12/2022 10:00',
      endTime: '25/12/2022 11:00'
    },
    // ...
    ]; */

    // Find orders for that fulfilment method between the start and end times.
    var orders = await Order.find({fulfilmentMethod: inputs.fulfilmentMethodId, fulfilmentSlotFrom: {'>=': moment(openTime, 'DD/MM/YYYY HH:mm').toString()}, fulfilmentSlotTo: {'<=': moment(closeTime, 'DD/MM/YYYY HH:mm').toString()}});

    /* var orders = [{
      fulfilmentSlotFrom: '17/02/2022 10:00',
      fulfilmentSlotTo: '17/02/2022 11:00',
      // ...
    }, {
      fulfilmentSlotFrom: '17/02/2022 13:00',
      fulfilmentSlotTo: '17/02/2022 14:00',
      // ...
    }]; */

    // Loop through possible slots and determine if number of orders is greater than ordersPerSlot
    for(var slotI of slots) {
      // Filter out orders between start and end of slot.
      var relevantOrders = orders.filter(order => {
        if(order.fulfilmentSlotFrom >= slotI.startTime && order.fulfilmentSlotTo <= slotI.endTime) {
          return true;
        } else {
          return false;
        }
      });

      if (relevantOrders.length < fulfilmentMethod.maxOrders) { // If there aren't too many orders in the slot
        availableSlots.push(slotI); // Add slot to availableSlots array
      }
    }

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

