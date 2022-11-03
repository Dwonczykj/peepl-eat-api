declare var OpeningHours: any;
declare var FulfilmentMethod: any;
import {
  dateStrFormat,
  getNextWeekday,
  timeStrFormat,
  OpeningHoursType,
  FulfilmentMethodType,
} from "../../scripts/utils";
import moment, { Moment } from 'moment';
import _ from 'lodash';

export type AvailableDateOpeningHours = {
  [dateString: string]: Array<OpeningHoursType>;
};

module.exports = {
  friendlyName: "Get available dates",

  description: "Get the available dates for a given fulfilmentMethod.",

  inputs: {
    fulfilmentMethodIds: {
      type: "ref",
      description:
        "The List of IDs of the fulfilmentMethods which are being requested.",
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Available slots",
    },
  },

  fn: async function (
    inputs: { fulfilmentMethodIds?: Array<number> },
    exits: { success: (unusedAv:AvailableDateOpeningHours) => AvailableDateOpeningHours }
  ) {
    // var availableDaysOfWeek: Array<DaysOfWeek> = [];
    // var availableSpecialDates: Array<moment.Moment> = [];

    // var fulfilmentMethod = await FulfilmentMethod.findOne(inputs.fulfilmentMethodId);

    // if (!fulfilmentMethod){
    //   return exits.success({
    //     availableDaysOfWeek,
    //     availableSpecialDates
    //   });
    // }

    // // Get special opening hours from DB (for specific date)
    // var openingHoursList:Array<any> = await OpeningHours.find({
    //   fulfilmentMethod: inputs.fulfilmentMethodId,
    //   isOpen: true,
    // });

    // // If there are opening hours available
    // openingHoursList.forEach(openingHours => {
    //   if(openingHours && openingHours.isOpen) {

    //     var dayOfWeek = openingHours.dayOfWeek;

    //     if(!openingHours.specialDate){
    //       // TODO: Check that not after cutoff
    //       // TODO: Check that in future and same as next-available-date logic
    //       // TODO: account for multiple opening hours on same dayOfWeek
    //       availableDaysOfWeek.push(dayOfWeek);
    //     } else {
    //       // TODO: account for multiple opening hours on same specialDate
    //       const specialDate = new Date(
    //         Date.parse(openingHours.specialDate.toString())
    //       );
    //       if (monthDiff(Date.now(), specialDate) < 4) {
    //         availableSpecialDates.push(moment.utc(specialDate));
    //       }
    //     }
    //   }
    // });

    var availableNextDatesOfWeek: {
      [fulfilmentMethodId: number]: AvailableDateOpeningHours;
    } = {};

    const fulfilmentMethods: Array<FulfilmentMethodType> =
      await FulfilmentMethod.find({
        id: inputs.fulfilmentMethodIds,
      });

    if (fulfilmentMethods.length < 1) {
      return exits.success({});
    } else {
      fulfilmentMethods.forEach((val) => {
        availableNextDatesOfWeek[val.id] = {};
      });
    }

    // Get special opening hours from DB (for specific date)
    for (const fulfilmentMethod of fulfilmentMethods) {
      var openingHoursList: Array<OpeningHoursType> = await OpeningHours.find({
        fulfilmentMethod: fulfilmentMethod.id,
        isOpen: true,
      }).populate('fulfilmentMethod');

      // If there are opening hours available
      openingHoursList.forEach((openingHours) => {
        if (openingHours && openingHours.isOpen) {
          // If generating slots for tomorrow, check if it is before the cutoff time
          let _dt: Moment;
          if (!openingHours.specialDate) {
            _dt = moment.utc(
              getNextWeekday(openingHours.dayOfWeek),
              dateStrFormat
            );
          } else {
            _dt = moment.utc(
              openingHours.specialDate.toString(),
              dateStrFormat
            );
            if (
              _dt.diff(moment.utc(), "month") >
              sails.config.custom.ignoreSpecialDatesMoreThanXMonthsAway
            ) {
              // ignore special date as more than 12 months away
              return; // break in callback
            }
          }
          const dt = _dt;
          const dtStr = dt.format(dateStrFormat);

          if (
            !Object.keys(
              availableNextDatesOfWeek[fulfilmentMethod.id]
            ).includes(dtStr)
          ) {
            availableNextDatesOfWeek[fulfilmentMethod.id][dtStr] = [];
          }
          let isAfterCutoff = false;
          const cutoffTime = fulfilmentMethod.orderCutoff; // e.g. 22:00

          if (cutoffTime) {
            const tomorrow = moment.utc().add(1, "days").startOf("day"); // End of day tomorrow

            // If dt is today
            if (dt.isSame(moment.utc(), "day")) {
              isAfterCutoff = true;
              const dtStrNextWeek = dt
                .clone()
                .add(1, 'weeks')
                .format(dateStrFormat);
              if (
                !Object.keys(
                  availableNextDatesOfWeek[fulfilmentMethod.id]
                ).includes(dtStrNextWeek)
              ) {
                availableNextDatesOfWeek[fulfilmentMethod.id][dtStrNextWeek] =
                  [];
              }
              availableNextDatesOfWeek[fulfilmentMethod.id][dtStrNextWeek].push(
                openingHours
              );
            } else if (dt.isSameOrBefore(tomorrow) && cutoffTime) {
              const cutoff = moment.utc(cutoffTime, timeStrFormat); // Moment version of cutoff time
              // If the current time is after the cutoff time, set isAfterCutoff to true
              if (moment.utc().isAfter(cutoff)) {
                isAfterCutoff = true;
              }
            } // else nothing (too far in the future)
          }

          if (!isAfterCutoff) {
            availableNextDatesOfWeek[fulfilmentMethod.id][dtStr].push(
              openingHours
            );
          }
        }
      });

      for (let dtStr of Object.keys(
        availableNextDatesOfWeek[fulfilmentMethod.id]
      )) {
        if (availableNextDatesOfWeek[fulfilmentMethod.id][dtStr].length === 0) {
          delete availableNextDatesOfWeek[fulfilmentMethod.id][dtStr];
        }
      }
    }

    // get the minumum date that is available for each fulfilment id...
    let intersectionDates = availableNextDatesOfWeek[fulfilmentMethods[0].id];
    fulfilmentMethods
      .filter((fm) => fm.id !== fulfilmentMethods[0].id)
      .forEach((fulfilmentMethod) => {
        const _intersectionDates = _.intersection(
          Object.keys(intersectionDates),
          Object.keys(availableNextDatesOfWeek[fulfilmentMethod.id])
        );

        for (const _dt of _intersectionDates) {
          const ohs1 = intersectionDates[_dt];
          const ohs2 = availableNextDatesOfWeek[fulfilmentMethod.id][_dt];
          intersectionDates[_dt] = [...ohs1, ...ohs2];
        }
      });

    // Send back the result through the success exit.
    return exits.success(intersectionDates);
  },
};

