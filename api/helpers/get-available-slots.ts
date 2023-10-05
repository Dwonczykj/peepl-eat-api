export {}; //SOLVED TypeScript Cannot Redeclare Block Scoped Variable Name https://backbencher.dev/articles/typescript-solved-cannot-redeclare-block-scoped-variable-name
import moment from "moment";
// import util from 'util';
import { iFulfilmentSlot } from "../../api/interfaces/vendors/slot";
import { dateStrFormat, DateString, datetimeStrFormat, FulfilmentMethodType, OpeningHoursType, OrderType, timeStrFormat } from "../../scripts/utils";
declare let OpeningHours: any;
declare let FulfilmentMethod: any;

module.exports = {
  friendlyName: "Get available slots",

  description:
    "Get the available time slots for a given date and fulfilmentMethod.",

  inputs: {
    date: {
      type: "string",
      description:
        "The date for which time slots need to be generated. Format YYYY-MM-DD",
      example: "2022-03-24",
      regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
      required: true,
    },
    fulfilmentMethodId: {
      type: "number",
      description: "The ID of the fulfilmentMethod which is being requested.",
      required: true,
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Available slots",
    },
  },

  fn: async function (
    inputs: { date: DateString; fulfilmentMethodId: number },
    exits: {
      success: (unusedAv: iFulfilmentSlot[]) => iFulfilmentSlot[];
    }
  ) {
    // TODO: Consider timezones
    // TODO: Account for overnight opening hours
    // TODO: Limit to ordering 7 days in future

    let availableSlots: iFulfilmentSlot[] = [];

    let fulfilmentMethod:FulfilmentMethodType = await FulfilmentMethod.findOne(
      inputs.fulfilmentMethodId
    );
    /* let fulfilmentMethod = {
      fulfilmentType: 'delivery',
      slotLength: 60,
      bufferLength: 15,
      vendorId: 1,
      ordersPerSlot: 1
    }; */
    let dt = moment.utc(inputs.date, "YYYY-MM-DD"); // Moment version of date
    let dayOfWeek = dt.format("dddd").toLowerCase(); // e.g. monday

    // Get special opening hours from DB (for specific date)
    let openingHoursList: Array<OpeningHoursType> = await OpeningHours.find({
      fulfilmentMethod: inputs.fulfilmentMethodId,
      specialDate: inputs.date,
    });

    /* let openingHours = {
        dayOfWeek: 'monday', // Monday
        specificDate: null,
        openTime: '09:00',
        closeTime: '17:00'
      }; */

    // If no special opening hours for this date
    if (!openingHoursList || openingHoursList.length < 1) {
      // Get regular opening hours for day of week
      openingHoursList = await OpeningHours.find({
        fulfilmentMethod: inputs.fulfilmentMethodId,
        dayOfWeek,
      });
    }

    if (!openingHoursList || openingHoursList.length < 1) {
      // No OpeningHours available for this date
      return exits.success(availableSlots);
    }

    // If generating slots for tomorrow, check if it is before the cutoff time
    let isAfterCutoff = false;
    const cutoffTime = fulfilmentMethod.orderCutoff; // e.g. 22:00

    if (cutoffTime) {
      const tomorrow = moment.utc().add(1, "days").startOf("day"); // End of day tomorrow

      // If dt is today
      if (dt.isSame(moment.utc(), "day")) {
        isAfterCutoff = true;
      } else if (dt.isSameOrBefore(tomorrow) && cutoffTime) {
        const cutoff = moment.utc(cutoffTime, "HH:mm"); // Moment version of cutoff time
        // If the current time is after the cutoff time, set isAfterCutoff to true
        if (moment.utc().isAfter(cutoff)) {
          isAfterCutoff = true;
        }
      } // else nothing (too far in the future)
    }

    // If there are opening hours available
    if (!isAfterCutoff) {
      const openOpeningHours = openingHoursList.filter((oh) => oh.isOpen);
      for (const openingHours of openOpeningHours) {
        let openTime = inputs.date + " " + openingHours.openTime; // e.g. 25/12/2022 09:00
        let closeTime = inputs.date + " " + openingHours.closeTime; // e.g. 25/12/2022 17:00

        let startTime = moment.utc(openTime, "YYYY-MM-DD HH:mm"); // Start time for creating slots.
        let endTime = moment.utc(closeTime, "YYYY-MM-DD HH:mm"); // End time for creating slots.

        let slots: iFulfilmentSlot[] = [];

        // Generate slots based on slotLength within opening hours.
        while (startTime < endTime) {
          let slot: iFulfilmentSlot;

          try {
	          const _startTime = startTime.clone();
	          startTime.add(fulfilmentMethod.slotLength, "minutes"); // in place to do while loop
	          const _endTime = startTime.clone();
            slot = {
              startTime: _startTime,
              endTime: _endTime,
              fulfilmentMethod: fulfilmentMethod,
            };
          } catch (error) {
            sails.log.error(`Unable to calculate fulfilment slots for opening hours window with error: ${error}`);
          }
          slots.push(slot);
        }

        /* let slots = [{
          startTime: '25/12/2022 09:00',
          endTime: '25/12/2022 10:00'
        }, {
          startTime: '25/12/2022 10:00',
          endTime: '25/12/2022 11:00'
        },
        // ...
        ]; */

        // Find orders for that fulfilment method between the start and end times.
        // var fulfilmentSlotFrom = moment.utc(openTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
        // var fulfilmentSlotTo = moment.utc(closeTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
        var orders: Array<OrderType>;
        if (sails.getDatastore().config.adapter === "sails-disk"){
          orders = await Order.find({
            fulfilmentMethod: inputs.fulfilmentMethodId,
            paymentStatus: "paid",
            restaurantAcceptanceStatus: { "!=": "rejected" },
            completedFlag: { "!=": "cancelled" },
          });
          if(orders.length > 0){
            orders = orders.filter(order => {
              return (
                moment
                  .utc(order.fulfilmentSlotFrom)
                  .isSameOrAfter(
                    moment.utc(openTime, `${dateStrFormat} ${timeStrFormat}`)
                  ) &&
                moment
                  .utc(order.fulfilmentSlotTo)
                  .isSameOrBefore(
                    moment.utc(closeTime, `${dateStrFormat} ${timeStrFormat}`)
                  )
              );
            });
          }
        }else{
          orders = await Order.find({
            fulfilmentMethod: inputs.fulfilmentMethodId,
            paymentStatus: 'paid',
            restaurantAcceptanceStatus: { '!=': 'rejected' },
            completedFlag: { '!=': 'cancelled' },
            fulfilmentSlotFrom: { '>=': openTime }, //BUG: this comparison doesnt work for disk db: sails-disk
            fulfilmentSlotTo: { '<=': closeTime },
          });
        }

        // Loop through possible slots and determine if number of orders is greater than ordersPerSlot
        sails.log.verbose(
          `helpers.getAvailableSlots initially found ${slots.length} slots for openingHours: ${openingHours.openTime}:${openingHours.closeTime}`
        );
        for (let slotI of slots) {
          // Filter out orders between start and end of slot.
          let relevantOrders = orders.filter((order) => {
            let mSlotFrom = moment.utc(order.fulfilmentSlotFrom);
            let mSlotTo = moment.utc(order.fulfilmentSlotTo);

            if (
              mSlotFrom.isSameOrAfter(slotI.startTime) &&
              mSlotTo.isSameOrBefore(slotI.endTime)
            ) {
              return true;
            } else {
              return false;
            }
          });
          sails.log.verbose(
            `helpers.getAvailableSlots found ${relevantOrders.length} existing orders for slot: ${slotI.startTime}:${slotI.endTime}`
          );

          // Is the time slot after current time plus fulfilment method buffer
          let isInFuture = moment
            .utc(slotI.startTime)
            .isAfter(
              moment.utc().add(fulfilmentMethod.bufferLength, "minutes")
            );

          if (
            (!fulfilmentMethod.maxOrders ||
              relevantOrders.length < fulfilmentMethod.maxOrders) &&
            isInFuture
          ) {
            // If there aren't too many orders in the slot
            availableSlots.push(slotI);
          } else {
            sails.log.info(
              `Excluding slot [${slotI.startTime.format(datetimeStrFormat)}] from get-available-slots helper call as there are already ${
                relevantOrders.length
              } orders scheduled for this slot and there are a maximum of ${
                fulfilmentMethod.maxOrders
              } orders allowed.`
            );
          }
        }
      }
      if (openOpeningHours.length < 1) {
        sails.log.info(
          "helpers.getAvailableSlots no available slots as " +
            (openingHoursList.length < 1
              ? `no opening hours exist with date: ${dt || dayOfWeek}`
              : "store is closed")
        );

        // let openingHoursAll = [];
        // try {
        //   openingHoursAll = await OpeningHours.find({
        //     fulfilmentMethod: inputs.fulfilmentMethodId,
        //   });
        // } catch (error) {
        //   //ignore
        // }
        // sails.log.info(
        //   `Vendors opening hours for ${
        //     fulfilmentMethod.methodType
        //   } fulfilmentMethod [${inputs.fulfilmentMethodId}] are: ${util.inspect(
        //     openingHoursAll,
        //     {
        //       depth: null,
        //     }
        //   )}`
        // );
      }
    }

    // Send back the result through the success exit.
    return exits.success(availableSlots);
  },
};
