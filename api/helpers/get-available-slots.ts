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
    // TODO: Generate IDs for slots to simplify logic (but must account for changes to opening hours and slot duration)

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
        dayOfWeek: 'monday', // Monday
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

      slot.startTime = startTime.clone();
      startTime.add(fulfilmentMethod.slotLength, 'minutes');
      slot.endTime = startTime.clone();

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
    var fulfilmentSlotFrom = moment(openTime, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
    var fulfilmentSlotTo = moment(closeTime, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
    var orders = await Order.find({fulfilmentMethod: inputs.fulfilmentMethodId, fulfilmentSlotFrom: {'>=': fulfilmentSlotFrom}, fulfilmentSlotTo: {'<=': fulfilmentSlotTo}});

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
        if(moment(order.fulfilmentSlotFrom).isSameOrAfter(slotI.startTime) && moment(order.fulfilmentSlotTo, 'YYYY-MM-DD HH:mm:ss').isSameOrBefore(slotI.endTime)) {
          return true;
        } else {
          return false;
        }
      });

      if (relevantOrders.length < fulfilmentMethod.maxOrders) { // If there aren't too many orders in the slot
        availableSlots.push(slotI); // Add slot to availableSlots array
      }
    }

    // Send back the result through the success exit.
    return availableSlots;
  }
};

