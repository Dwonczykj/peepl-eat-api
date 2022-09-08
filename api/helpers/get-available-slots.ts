declare var OpeningHours: any;
declare var FulfilmentMethod: any;
var moment = require('moment');
module.exports = {


  friendlyName: 'Get available slots',


  description: 'Get the available time slots for a given date and fulfilmentMethod.',


  inputs: {
    date: {
      type: 'string',
      description: 'The date for which time slots need to be generated. Format YYYY-MM-DD',
      example: '2022-03-24',
      regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
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
    // TODO: Limit to ordering 7 days in future

    var availableSlots = [];

    var fulfilmentMethod = await FulfilmentMethod.findOne(inputs.fulfilmentMethodId);
    /* var fulfilmentMethod = {
      fulfilmentType: 'delivery',
      slotLength: 60,
      bufferLength: 15,
      vendorId: 1,
      ordersPerSlot: 1
    }; */

    var dt = new moment(inputs.date, 'YYYY-MM-DD'); // Moment version of date
    var dayOfWeek = dt.format('dddd').toLowerCase(); // e.g. monday

    // Get special opening hours from DB (for specific date)
    var openingHours = await OpeningHours.findOne({
      fulfilmentMethod: inputs.fulfilmentMethodId,
      specialDate: inputs.date
    });

    /* var openingHours = {
        dayOfWeek: 'monday', // Monday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      }; */
    // If no special opening hours for this date
    if(!openingHours) {
      // Get regular opening hours for day of week
      openingHours = await OpeningHours.findOne({
        fulfilmentMethod: inputs.fulfilmentMethodId,
        dayOfWeek
      });
    }


    // If generating slots for tomorrow, check if it is before the cutoff time
    let isAfterCutoff = false;
    const cutoffTime = fulfilmentMethod.orderCutoff; // e.g. 15:00

    if(cutoffTime){
      const tomorrow = moment().add(1, 'days').endOf('day'); // End of day tomorrow

      if(dt.isSameOrBefore(tomorrow) && cutoffTime) {
        const cutoff = moment(cutoffTime, 'HH:mm'); // Moment version of cutoff time
        // If the current time is after the cutoff time, set isAfterCutoff to true
        if(moment().isAfter(cutoff)) {
          isAfterCutoff = true;
        }
      }
    }

    // If there are opening hours available
    if(openingHours && openingHours.isOpen && !isAfterCutoff) {

      var openTime = inputs.date + ' ' + openingHours.openTime; // e.g. 25/12/2022 09:00
      var closeTime = inputs.date + ' ' + openingHours.closeTime; // e.g. 25/12/2022 17:00

      var startTime = moment.utc(openTime, 'YYYY-MM-DD HH:mm'); // Start time for creating slots.
      var endTime = moment.utc(closeTime, 'YYYY-MM-DD HH:mm'); // End time for creating slots.

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
      // var fulfilmentSlotFrom = moment(openTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
      // var fulfilmentSlotTo = moment(closeTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
      var orders = await Order.find({
        fulfilmentMethod: inputs.fulfilmentMethodId,
        paymentStatus: 'paid',
        restaurantAcceptanceStatus: { '!=' : 'declined' },
        fulfilmentSlotFrom: {'>=': openTime},
        fulfilmentSlotTo: {'<=': closeTime},
        completedFlag: ''
      });

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
          var mSlotFrom = moment.utc(order.fulfilmentSlotFrom);
          var mSlotTo = moment.utc(order.fulfilmentSlotTo);

          if(mSlotFrom.isSameOrAfter(slotI.startTime) && mSlotTo.isSameOrBefore(slotI.endTime)) {
            return true;
          } else {
            return false;
          }
        });

        // Is the time slot after current time plus fulfilment method buffer
        var isInFuture = moment.utc(slotI.startTime).isAfter(moment().add(fulfilmentMethod.bufferLength, 'minutes'));

        if ((!fulfilmentMethod.maxOrders || (relevantOrders.length <= fulfilmentMethod.maxOrders)) && isInFuture) { // If there aren't too many orders in the slot
          availableSlots.push(slotI); // Add slot to availableSlots array
        }
      }
    } else {
      availableSlots = [];
    }

    // Send back the result through the success exit.
    return availableSlots;
  }
};

