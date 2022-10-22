export {}; //SOLVED TypeScript Cannot Redeclare Block Scoped Variable Name https://backbencher.dev/articles/typescript-solved-cannot-redeclare-block-scoped-variable-name
declare let FulfilmentMethod: any;
declare let sails: any;
import {
  intersectTimeWindowArrays,
  iSlot,
  TimeWindow as TimeWindow,
} from "../interfaces/vendors/slot";

import moment from "moment";
import {
  dateStrFormat,
  FulfilmentMethodType,
} from "../../scripts/utils";
import { AvailableDateOpeningHours } from "./get-available-dates";
// import util from 'util';

module.exports = {
  friendlyName: "Next available slot",

  description:
    "Get the  next available time slot for a given date and fulfilmentMethod.",

  inputs: {
    fulfilmentMethodIds: {
      type: "ref",
      description:
        "The IDs of the fulfilmentMethods which are being requested.",
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Available slot",
    },
  },

  fn: async function (
    inputs: { fulfilmentMethodIds?: Array<number> },
    exits: { success: CallableFunction }
  ) {
    let nextAvailableSlot: {
      startTime: moment.Moment;
      endTime: moment.Moment;
    };
    const noAvailableSlot = {};

    const fulfilmentMethods: Array<FulfilmentMethodType> =
      await FulfilmentMethod.find({
        id: inputs.fulfilmentMethodIds,
      });

    if (fulfilmentMethods.length < 1) {
      return exits.success(noAvailableSlot);
    }

    const nextAvailableDateDict: AvailableDateOpeningHours =
      await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: inputs.fulfilmentMethodIds,
      });
    const availableDates = Object.keys(nextAvailableDateDict)
      .map((dateStr) => moment.utc(dateStr, dateStrFormat))
      .sort((a, b) => (a.isBefore(b) ? -1 : 1));
  
    for (const nextAvailableDate of availableDates){
      const nextAvailableDateOpeningHours =
        nextAvailableDateDict[nextAvailableDate.format(dateStrFormat)];

      if (
        !nextAvailableDateOpeningHours ||
        nextAvailableDateOpeningHours.length < 1
      ) {
        continue;
      }

      const possibleFulfilmentMethods = Array.from(
        new Set(
          nextAvailableDateOpeningHours.map(
            (openingHours) => openingHours.fulfilmentMethod
          )
        )
      );

      const allAvailableSlots: {
        [fulfilmentMethodId: string]: TimeWindow[];
      } = {};
      const _cb = async (fm) => {
        const x: iSlot[] = await sails.helpers.getAvailableSlots.with({
          date: nextAvailableDate.format(dateStrFormat),
          fulfilmentMethodId: fm.id, // * for vendor fm, should not return 10 - 11am where this has 1 order
        });
        allAvailableSlots[fm.id] = x.map(
          (_islot) =>
            new TimeWindow({
              startTime: _islot.startTime,
              endTime: _islot.endTime,
            })
        );
      };
      const fmToSlotsCb = possibleFulfilmentMethods.map((fm) => _cb(fm));
      const combine = Promise.all(fmToSlotsCb);
      await combine;

      let intersectedSlots: TimeWindow[] = null;
      for (let i = 0; i < possibleFulfilmentMethods.length; i += 1) {
        if (intersectedSlots === null) {
          intersectedSlots = allAvailableSlots[possibleFulfilmentMethods[i].id];
        } else {
          try {
            intersectedSlots = intersectTimeWindowArrays(
              intersectedSlots,
              allAvailableSlots[possibleFulfilmentMethods[i].id]
            );
          } catch (error) {
            sails.log.error(error);
            return exits.success(noAvailableSlot); // Dont continue as we hit an error!
          }
        }
      }

      if (intersectedSlots.length > 0) {
        nextAvailableSlot = intersectedSlots.sort((a, b) =>
          a.startsBefore(b) ? -1 : 1
        )[0];

        return exits.success(nextAvailableSlot);
      }

      continue;
    }

    // All done, no date tried had slots available.
    return exits.success(noAvailableSlot);
  },
};
